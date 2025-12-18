import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { sendContactConfirmationEmail, sendContactAdminNotification } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await request.json();
    let { name, email, category, message, subject } = body;

    // Map subject to category if category is missing (Frontend sends 'subject')
    if (!category && subject) {
      category = subject;
    }

    // Validate required fields
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Message must be at least 10 characters long.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Create contact record
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category.trim(),
      message: message.trim(),
      status: 'new'
    });

    // Save to database
    const savedContact = await contact.save();

    console.log('💾 Contact form submission saved:', {
      id: savedContact._id,
      name: savedContact.name,
      email: savedContact.email,
      category: savedContact.category,
      timestamp: savedContact.createdAt
    });

    // Send both emails in parallel (fire and forget for faster response)
    const emailPromises = Promise.allSettled([
      sendContactConfirmationEmail({
        name: savedContact.name,
        email: savedContact.email,
        subject: savedContact.category,
        message: savedContact.message,
        submissionId: savedContact._id.toString()
      }),
      sendContactAdminNotification({
        name: savedContact.name,
        email: savedContact.email,
        subject: savedContact.category,
        message: savedContact.message,
        submissionId: savedContact._id.toString()
      })
    ]);

    // Log results asynchronously (don't block response)
    emailPromises.then(results => {
      results.forEach((result, index) => {
        const emailType = index === 0 ? 'User confirmation' : 'Admin notification';
        if (result.status === 'fulfilled') {
          console.log(`✅ ${emailType} email sent`);
        } else {
          console.error(`❌ ${emailType} email failed:`, result.reason);
        }
      });
    }).catch(err => {
      console.error('❌ Unexpected email error:', err);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
        data: {
          id: savedContact._id,
          submittedAt: savedContact.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Contact form submission error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate email errors (if we add unique constraint later)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A submission with this email already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: GET method to retrieve contact submissions (for admin use)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const contacts = await (Contact as any).find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Contact.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: contacts.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contacts.' },
      { status: 500 }
    );
  }
}
