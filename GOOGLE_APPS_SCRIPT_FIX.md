# 🔧 Google Apps Script Fix - Trigger Interval Issue

## ❌ **Error Fixed:**
```
❌ Error setting up trigger: { [Exception: The value you passed to everyMinutes was invalid. It must be one of 1, 5, 10, 15 or 30.] name: 'Exception' }
```

## ✅ **Solution:**
Google Apps Script only allows these intervals for time-based triggers:
- **1 minute**
- **5 minutes** 
- **10 minutes**
- **15 minutes**
- **30 minutes**

## 🔧 **Fix to Apply in Google Apps Script:**

### **1. Update `setupFormTrigger()` function:**

**Replace this code:**
```javascript
// Create time-based trigger (more reliable than form trigger)
const newTrigger = ScriptApp.newTrigger('checkForNewResponses')
  .timeBased()
  .everyMinutes(2) // ❌ INVALID - This was causing the error
  .create();
```

**With this code:**
```javascript
// Create time-based trigger (more reliable than form trigger)
const newTrigger = ScriptApp.newTrigger('checkForNewResponses')
  .timeBased()
  .everyMinutes(5) // ✅ VALID - Check every 5 minutes for new responses
  .create();
```

### **2. Steps to Fix:**

1. **Go to your Google Apps Script project**
2. **Find the `setupFormTrigger()` function**
3. **Change `.everyMinutes(2)` to `.everyMinutes(5)`**
4. **Save the project**
5. **Run `setupFormTrigger()` function**
6. **Check execution logs for success message**

### **3. Expected Success Output:**
```
✅ Time-based trigger created successfully!
Trigger ID: [some-trigger-id]
```

## 📧 **Alternative Intervals:**
If you want faster checking, you can use:
- `.everyMinutes(1)` - Every 1 minute (fastest)
- `.everyMinutes(5)` - Every 5 minutes (recommended)
- `.everyMinutes(10)` - Every 10 minutes
- `.everyMinutes(15)` - Every 15 minutes  
- `.everyMinutes(30)` - Every 30 minutes (slowest)

## 🎯 **Recommended:**
Use `.everyMinutes(5)` for a good balance between responsiveness and not overwhelming the system.

## ✅ **After Fix:**
- Trigger will be created successfully
- Emails will be sent every 5 minutes when new form responses are detected
- No more interval errors in execution logs
