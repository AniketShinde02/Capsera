# 🚀 Google Forms + Apps Script Setup Guide for Capsera Feedback

## 📋 Step-by-Step Setup Instructions

### **Step 1: Create Google Form**

1. **Go to [forms.google.com](https://forms.google.com)**
2. **Click "Blank"** to create a new form
3. **Set up your form fields** in this exact order:

   ```
   Field 1: Name (Short answer) - Required
   Field 2: Email (Short answer with email validation) - Required  
   Field 3: Feedback Type (Multiple choice) - Required
     Options:
     - Bug Report
     - Feature Request
     - General Feedback
     - Performance Issue
     - UI/UX Feedback
     - Other
   Field 4: Message (Paragraph) - Required
   Field 5: Rating (Scale 1-5) - Optional
   ```

4. **Customize your form:**
   - Add title: "Capsera Feedback Form"
   - Add description: "Help us improve Capsera! Your feedback is invaluable."
   - Choose a theme/color scheme
   - Enable "Collect email addresses"

### **Step 2: Get Form Field IDs**

1. **Right-click on each field** → "Inspect Element"
2. **Find the `name` attribute** in the HTML (looks like `entry.1234567890`)
3. **Note down each field ID** - you'll need these for the Apps Script

### **Step 3: Set Up Google Apps Script**

1. **Open your Google Form**
2. **Click the 3 dots menu (⋮)** in the top right
3. **Select "Script editor"**
4. **Replace the default code** with the code from `google-apps-script.js`
5. **Update the admin email** in the script:
   ```javascript
   const adminEmail = 'your-admin-email@domain.com'; // Replace with your email
   ```

### **Step 4: Configure Form Trigger**

1. **In Apps Script editor**, click **"Triggers"** (clock icon)
2. **Click "Add Trigger"**
3. **Configure:**
   - Function: `onFormSubmit`
   - Event source: `From form`
   - Event type: `On form submit`
4. **Click "Save"**

### **Step 5: Authorize Permissions**

1. **Run the script once** (click ▶️ or Ctrl+R)
2. **Authorize permissions** when prompted
3. **Allow** Gmail and Forms access

### **Step 6: Test the Automation**

1. **Run the test function**: `testEmailAutomation()`
2. **Submit a test form** to verify emails are sent
3. **Check both** user and admin emails

### **Step 7: Update API Route**

1. **Open** `src/app/api/feedback/submit/route.ts`
2. **Replace** `YOUR_GOOGLE_FORM_URL_HERE` with your actual Google Form URL
3. **Replace** the `entry.XXXXXXX` placeholders with your actual field IDs

### **Step 8: Embed in Your Site**

1. **Get the embed code** from your Google Form:
   - Click "Send" in your form
   - Click the embed icon (<>)
   - Copy the iframe code

2. **Or use our custom component** (already created in `FeedbackForm.tsx`)

## 🎨 Customization Options

### **Email Templates**
The script includes different email templates for each feedback type:
- 🐛 **Bug Report**: Red theme, investigation-focused
- 💡 **Feature Request**: Blue theme, roadmap-focused  
- 💬 **General Feedback**: Green theme, appreciation-focused
- ⚡ **Performance Issue**: Orange theme, technical-focused

### **Admin Notifications**
Admin emails include:
- Priority indicators (color-coded by rating)
- Direct reply links
- Spreadsheet access links
- Complete feedback details

### **Advanced Features**
You can add:
- Auto-categorization
- Follow-up sequences
- Integration with project management tools
- Analytics and reporting

## 🔧 Troubleshooting

### **Common Issues:**

1. **Emails not sending:**
   - Check Gmail API permissions
   - Verify admin email address
   - Check spam folder

2. **Form not submitting:**
   - Verify field IDs in API route
   - Check Google Form URL
   - Test form submission manually

3. **Script errors:**
   - Check browser console for errors
   - Verify all required fields are present
   - Test with `testEmailAutomation()` function

## 📊 Analytics & Monitoring

### **Track Feedback:**
- Google Forms automatically creates a spreadsheet
- Apps Script logs all submissions
- Admin emails provide immediate notifications

### **Response Time:**
- User receives thank you email immediately
- Admin receives notification within seconds
- Follow-up can be automated or manual

## 🚀 Next Steps

1. **Create your Google Form** using the instructions above
2. **Set up Apps Script** with the provided code
3. **Test the automation** thoroughly
4. **Update the API route** with your form details
5. **Embed in your Capsera app** using the FeedbackForm component

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all configurations are correct
3. Test each component individually
4. Check Google Apps Script execution logs

---

**Ready to go live?** Once everything is set up, your feedback system will:
- ✅ Collect unlimited feedback submissions
- ✅ Send automated thank you emails
- ✅ Notify you of new feedback instantly
- ✅ Categorize feedback by type and priority
- ✅ Provide a professional user experience
