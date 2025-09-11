# 🚀 Cloudinary Setup Guide for Capsera

## 📋 **What You Need to Do:**

### **Step 1: Create Cloudinary Account**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### **Step 2: Get Your Credentials**
1. **Dashboard**: After login, go to your dashboard
2. **Account Details**: Look for "Account Details" section
3. **Copy These Values**:
   - **Cloud Name** (e.g., `myapp123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### **Step 3: Update Your Environment Variables**

#### **Option A: .env.local file**
```bash
# Remove old ImageKit variables
# IMAGEKIT_PUBLIC_KEY=xxx
# IMAGEKIT_PRIVATE_KEY=xxx
# IMAGEKIT_URL_ENDPOINT=xxx

# Add new Cloudinary variables
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### **Option B: Vercel Environment Variables**
1. Go to your Vercel dashboard
2. Select your Capsera project
3. Go to Settings → Environment Variables
4. **Remove** old ImageKit variables
5. **Add** new Cloudinary variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### **Step 4: Test the Setup**
1. **Restart your development server**
2. **Try uploading an image**
3. **Check terminal logs** for Cloudinary messages

## 🎯 **What This Gives You:**

✅ **Image Upload**: Works exactly like before  
✅ **Image Deletion**: Now fully supported!  
✅ **Better Performance**: Cloudinary CDN  
✅ **Free Plan**: 25 GB monthly  
✅ **Professional API**: Better error handling  

## 🔍 **Troubleshooting:**

- **"Cloudinary not configured"**: Check environment variables
- **"Upload failed"**: Verify API credentials
- **"Delete failed"**: Check public ID format

## 📞 **Need Help?**

- **Cloudinary Docs**: [docs.cloudinary.com](https://docs.cloudinary.com)
- **Free Support**: Available in their community forum
- **Paid Support**: Available for business accounts

---

**Ready to proceed?** Let me know when you've set up the environment variables! 🚀
