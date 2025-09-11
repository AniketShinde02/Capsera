# CaptionCraft Setup Guide

## Prerequisites

- Node.js 18+ 
- MongoDB database
- Google AI API key
- ImageKit account (for image uploads)

## Environment Variables

Copy the `env.example` file to `.env` and fill in your values:

```bash
cp env.example .env
```

### Required Environment Variables

1. **Database**
   - `MONGODB_URI`: Your MongoDB connection string

2. **Authentication (NextAuth)**
   - `NEXTAUTH_SECRET`: Random secret for NextAuth
   - `NEXTAUTH_URL`: Your app URL (http://localhost:9002 for dev)
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

3. **AI Service (Genkit)**
   - `GOOGLE_API_KEY`: Google AI API key from [MakerSuite](https://makersuite.google.com/app/apikey)

4. **Image Upload (ImageKit)**
   - `IMAGEKIT_PUBLIC_KEY`: Your ImageKit public key
   - `IMAGEKIT_PRIVATE_KEY`: Your ImageKit private key
   - `IMAGEKIT_URL_ENDPOINT`: Your ImageKit URL endpoint

5. **Email (Optional)**
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP settings for email functionality

## Getting API Keys

### Google AI API Key
1. Go to [Google MakerSuite](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GOOGLE_API_KEY`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:9002/api/auth/callback/google`

### ImageKit
1. Sign up at [ImageKit](https://imagekit.io/)
2. Get your public key, private key, and URL endpoint
3. Add them to your `.env` file

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env`

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:9002](http://localhost:9002)

## Admin Access

To access the admin panel, you need to create a user with admin privileges. The current system checks for these email addresses:

- `ai.captioncraft@outlook.com`
- `ai.captioncraft@outlook.com`

You can modify this in the admin API routes to implement proper role-based access control.

## Troubleshooting

### "AI service is not configured" Error
- Check that `GOOGLE_API_KEY` is set in your `.env` file
- Verify the API key is valid and has access to Gemini models
- Restart your development server after adding environment variables

### Image Upload Issues
- Verify ImageKit credentials in `.env`
- Check that the image file is under 10MB
- Ensure the file format is PNG, JPG, or GIF

### Database Connection Issues
- Verify MongoDB is running
- Check your `MONGODB_URI` connection string
- Ensure the database exists and is accessible

## Development

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini via Genkit
- **Authentication**: NextAuth.js
- **Image Storage**: ImageKit

## File Structure

```
src/
├── app/                 # Next.js app router
│   ├── admin/          # Admin panel pages
│   ├── api/            # API endpoints
│   └── ...
├── components/          # React components
├── lib/                # Utility libraries
├── models/             # Database models
└── ai/                 # AI integration
    ├── genkit.ts       # Genkit configuration
    └── flows/          # AI workflows
```
