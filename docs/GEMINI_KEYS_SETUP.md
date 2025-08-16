# Gemini API Key Rotation System Setup Guide

## 🎯 **Overview**
This system automatically rotates between multiple Gemini API keys to maximize your free tier quota and avoid rate limits. It's designed for MVP survival mode - keeping your app running without burning through API limits.

## 🔑 **Required Environment Variables**

Add these to your `.env` file:

```bash
# Gemini AI - Key Rotation System (REQUIRED)
GEMINI_API_KEY_1=AIzaSyC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_API_KEY_2=AIzaSyC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_API_KEY_3=AIzaSyC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_API_KEY_4=AIzaSyC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Keep existing Genkit setup (don't change this yet)
GOOGLE_GENAI=AIzaSyC_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 📋 **Setup Steps**

### 1. **Get Multiple Gemini API Keys**
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create 4 separate API keys
- Each key gets 1500 requests/day and 15 requests/minute
- **Total capacity: 6000 requests/day, 60 requests/minute**

### 2. **Add Keys to Environment**
```bash
# Copy your keys exactly as shown
GEMINI_API_KEY_1=AIzaSyC_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
GEMINI_API_KEY_2=AIzaSyC_def456ghi789jkl012mno345pqr678stu901vwx234yz567abc
GEMINI_API_KEY_3=AIzaSyC_ghi789jkl012mno345pqr678stu901vwx234yz567abc890def
GEMINI_API_KEY_4=AIzaSyC_jkl012mno345pqr678stu901vwx234yz567abc890def123ghi
```

### 3. **Restart Your Application**
```bash
npm run dev
# or
yarn dev
```

## ⚡ **How It Works**

### **Automatic Key Rotation**
- **Every 4 seconds**: System switches to next available key
- **Smart selection**: Only uses keys that aren't rate limited
- **Load balancing**: Distributes requests evenly across all keys

### **Rate Limiting Protection**
- **Per-key limit**: 15 requests/minute per key
- **Daily limit**: 1500 requests/day total
- **IP protection**: 5 requests/minute per IP address

### **Fallback System**
- If one key is exhausted → automatically uses next available
- If all keys are rate limited → graceful error message
- Daily reset at midnight UTC

## 📊 **Monitoring & Management**

### **Admin Dashboard**
Visit `/admin/keys` to see:
- Real-time key status
- Usage statistics
- Rate limit monitoring
- Key management controls

### **Key Actions**
- **Deactivate key**: If one gets rate limited
- **Reactivate all**: Reset all keys to active
- **Reset rate limits**: Clear IP-based limits

## 🚨 **Troubleshooting**

### **"No Gemini API keys found" Error**
```bash
# Check your .env file has:
GEMINI_API_KEY_1=your_key_here
GEMINI_API_KEY_2=your_key_here
# etc...

# Make sure no spaces around =
# Make sure keys start with AIzaSyC_
```

### **Keys Not Rotating**
```bash
# Check server logs for:
🔑 Gemini API Key 1 loaded successfully
🔑 Gemini API Key 2 loaded successfully
✅ Gemini Key Manager initialized with 4 keys
```

### **Rate Limited Too Quickly**
- Each key needs 4 seconds between requests
- System automatically waits if needed
- Check admin dashboard for current status

## 📈 **Performance Tips**

### **For High Traffic**
- **Monitor usage**: Check `/admin/keys` regularly
- **Deactivate problematic keys**: If one gets rate limited
- **Plan for paid tier**: When approaching 6000 requests/day

### **For Development**
- **Test with multiple keys**: Ensure rotation works
- **Monitor logs**: Watch for key usage patterns
- **Use admin tools**: Test deactivation/reactivation

## 🔄 **Migration from Single Key**

### **Before (Single Key)**
```bash
GOOGLE_GENAI=AIzaSyC_single_key_here
```

### **After (Key Rotation)**
```bash
# Add these new variables
GEMINI_API_KEY_1=AIzaSyC_key1_here
GEMINI_API_KEY_2=AIzaSyC_key2_here
GEMINI_API_KEY_3=AIzaSyC_key3_here
GEMINI_API_KEY_4=AIzaSyC_key4_here

# Keep existing for now (will be updated later)
GOOGLE_GENAI=AIzaSyC_single_key_here
```

## 🎯 **Expected Results**

### **Immediate Benefits**
- ✅ **4x more requests**: 6000 vs 1500 per day
- ✅ **Better uptime**: Keys rotate automatically
- ✅ **User experience**: Fewer "quota exceeded" errors
- ✅ **Monitoring**: Real-time usage tracking

### **Long-term Benefits**
- 🚀 **Scalability**: Handle more users
- 💰 **Cost control**: Maximize free tier
- 📊 **Analytics**: Usage insights for growth
- 🔧 **Flexibility**: Easy key management

## 🆘 **Support**

### **Common Issues**
1. **Keys not loading**: Check `.env` file format
2. **Rotation not working**: Restart application
3. **Still getting rate limited**: Check admin dashboard
4. **Admin access denied**: Ensure user has admin role

### **Get Help**
- Check server logs for error messages
- Visit `/admin/keys` for real-time status
- Review this documentation
- Check console for key manager logs

---

**🎉 You're now running a production-ready API key rotation system!**
