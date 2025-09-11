# 🧪 Cloudinary Migration Test Plan

## 📋 **Test Overview**
This document outlines comprehensive testing to ensure the Cloudinary migration works in every situation.

## 🎯 **Test Scenarios**

### **1. Image Upload Tests**
- [ ] **Basic Upload**: Upload a small image (< 1MB)
- [ ] **Large Upload**: Upload an image close to 10MB limit
- [ ] **File Type Validation**: Test PNG, JPG, JPEG, GIF
- [ ] **Invalid File Types**: Test PDF, TXT, DOC (should fail)
- [ ] **Network Interruption**: Test upload with poor connection
- [ ] **Retry Logic**: Verify exponential backoff works
- [ ] **Signed Uploads Only**: Verify client uses server-side signature; block direct use of API secret or open unsigned presets
### **2. Image Deletion Tests**
- [ ] **Profile Image Deletion**: Remove user profile image
- [ ] **Caption Image Deletion**: Delete caption with associated image
- [ ] **Invalid Public ID**: Test deletion with malformed public ID
- [ ] **Non-existent Image**: Test deletion of already deleted image
- [ ] **Network Failures**: Test deletion during network issues
- [ ] **Derived Assets**: Delete originals with many derivatives; confirm derivatives removed
### **3. Caption Generation Tests**
- [ ] **With Cloudinary Image**: Generate captions from uploaded image
- [ ] **Public ID Storage**: Verify public ID is stored for future deletion
- [ ] **Rate Limiting**: Test with anonymous and authenticated users
- [ ] **AI Service Failures**: Test when AI service is down
- [ ] **Safety & Moderation**: Block unsafe prompts/outputs; profanity, hate, sexual content
### **4. Error Handling Tests**
- [ ] **Cloudinary Service Down**: Test when Cloudinary is unavailable
- [ ] **Invalid Credentials**: Test with wrong API keys
- [ ] **File Size Exceeded**: Test uploads > 10MB
- [ ] **Malformed Requests**: Test with invalid request data
- [ ] **Timeouts**: Client/server timeouts enforced; request aborted as expected
- [ ] **Retry Policy**: Exponential backoff with jitter and max attempts; no retries on 4xx
- [ ] **Circuit Breaker**: Opens on sustained failures; quick recovery verified
- [ ] **Error Mapping**: UX shows actionable messages without exposing secrets
- [ ] **Correlation IDs**: Trace logs and requests end-to-end- [ ] **AI Service Failures**: Test when AI service is down

### **4. Error Handling Tests**
- [ ] **Cloudinary Service Down**: Test when Cloudinary is unavailable
- [ ] **Invalid Credentials**: Test with wrong API keys
- [ ] **File Size Exceeded**: Test uploads > 10MB
- [ ] **Malformed Requests**: Test with invalid request data

### **5. Edge Cases**
- [ ] **Concurrent Uploads**: Multiple users uploading simultaneously
- [ ] **Large Batch Operations**: Multiple image deletions
- [ ] **Memory Pressure**: Test under high memory usage
- [ ] **Timeout Scenarios**: Test with slow network

## 🚀 **Test Execution Steps**

### **Phase 1: Basic Functionality**
1. Start development server
2. Upload a test image
3. Verify Cloudinary logs appear
4. Generate captions
5. Delete the image
6. Verify deletion logs

### **Phase 2: Error Scenarios**
1. Test invalid file types
2. Test oversized files
3. Test network interruptions
4. Test service failures

### **Success Indicators**
- ✅ All uploads show "Cloudinary upload successful"
- ✅ All deletions show "Image deleted from Cloudinary"
- ✅ No ImageKit-related errors in logs
- ✅ Public IDs are properly extracted and stored
- ✅ Error handling gracefully manages failures
- ✅ No API secret/signature exposed client-side or in logs
- ✅ All requests over HTTPS; no mixed content
- ✅ No PII written to logs; secrets redacted
### **Success Indicators**
- ✅ All uploads show "Cloudinary upload successful"
- ✅ All deletions show "Image deleted from Cloudinary"
- ✅ No ImageKit-related errors in logs
- ✅ Public IDs are properly extracted and stored
- ✅ Error handling gracefully manages failures

### **Failure Indicators**
- ❌ "ImageKit" appears in any logs
- ❌ Upload failures without retry attempts
- ❌ Deletion failures without proper error messages
- ❌ Public ID extraction failures

## 🔍 **Monitoring Points**

### **Terminal Logs**
- Look for "Starting Cloudinary upload"
- Look for "Cloudinary upload successful"
- Look for "Image deleted from Cloudinary"
- No "ImageKit" references

### **Network Tab**
- Verify requests to Cloudinary APIs
- Check response status codes
- Monitor upload/download speeds

### **Database**
- Verify public IDs are stored
- Check image URLs are Cloudinary format
- Ensure no orphaned ImageKit references

## 🚨 **Rollback Plan**

If issues arise:
1. **Immediate**: Revert to ImageKit configuration
2. **Investigation**: Debug Cloudinary issues
3. **Fix**: Resolve specific problems
4. **Retest**: Validate fixes before re-migration

## 📝 **Test Results Log**

| Test | Status | Notes | Date |
|------|--------|-------|------|
| Basic Upload | ⏳ Pending | | |
| Large Upload | ⏳ Pending | | |
| File Validation | ⏳ Pending | | |
| Profile Deletion | ⏳ Pending | | |
| Caption Deletion | ⏳ Pending | | |
| Error Handling | ⏳ Pending | | |

---

**Ready to test?** Start with Phase 1 and work through each scenario systematically!
