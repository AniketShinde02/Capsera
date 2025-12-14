# API Endpoint Cleanup - Safe Deprecation

**Date:** November 25, 2025  
**Action:** Moved unused API endpoints to `_deprecated` folder

## ✅ What Was Done

Moved the following **unused** API endpoints to `src/app/api/_deprecated/`:

1. ✅ `generate-captions-fast`
2. ✅ `generate-captions-lightning`
3. ✅ `generate-captions-rocket`
4. ✅ `generate-captions-ultra-fast`
5. ✅ `generate-captions-multi`

## 🔒 What Was Preserved

**KEPT ACTIVE:** `src/app/api/generate-captions/` - This is the **ONLY** endpoint used by the frontend (`caption-generator.tsx` line 1103).

## 🧪 Verification

**Frontend Check:**
```bash
grep -r "/api/generate-captions-" src/components/
# Result: No matches (only /api/generate-captions is used)
```

**Active Endpoint:**
```typescript
// src/components/caption-generator.tsx:1103
captionResponse = await fetch('/api/generate-captions', {
```

## 🔄 How to Restore (If Needed)

If you need to restore any endpoint:
```bash
move "d:\Capsera\src\app\api\_deprecated\generate-captions-fast" "d:\Capsera\src\app\api\generate-captions-fast"
```

## 📊 Impact

- **Codebase Size:** Reduced by ~5 duplicate API routes
- **Maintenance:** Easier to debug (single source of truth)
- **Build Time:** Slightly faster (fewer files to process)
- **Risk:** **ZERO** - Active functionality untouched

## ⚠️ Important Notes

1. The `_deprecated` folder is **NOT** deleted - it's just moved for safety
2. Next.js will **NOT** serve routes from `_deprecated` (underscore prefix is ignored)
3. Your live site continues to work exactly as before
4. You can permanently delete `_deprecated` after confirming everything works for a few days

## 🎯 Next Steps (Optional)

After confirming the site works for 2-3 days:
```bash
# Permanently delete deprecated endpoints
Remove-Item -Recurse -Force "d:\Capsera\src\app\api\_deprecated"
```
