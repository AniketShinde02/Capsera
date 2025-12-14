# 💰 AI Model Configuration

Choose between FREE or PAID AI models for caption generation.

## 🆓 Free Model (Default)
- **Model:** qwen/qwen2.5-vl-3b-instruct:free
- **Cost:** $0.00 per image
- **Quality:** Good (may require enhanced parsing)
- **Speed:** Fast
- **Limit:** OpenRouter rate limits apply

## 💰 Paid Model (Recommended for Production)
- **Model:** openai/gpt-4o-mini  
- **Cost:** ~$0.0004-$0.001 per image
- **Quality:** Excellent (guaranteed JSON output)
- **Speed:** Very fast
- **Limit:** Based on your OpenRouter credits

---

## 🔧 How to Enable Free Model

Add to your `.env` file:

```bash
USE_FREE_AI_MODEL=true
```

To use paid model (default):

```bash
USE_FREE_AI_MODEL=false
# Or simply don't set the variable
```

---

## 💸 Cost Optimization Applied

### ✅ Cloudinary URL Optimization
- Automatically transforms images to **512px width**
- Uses **`q_auto:eco`** for minimal file size
- Forces **JPG format** for better compression

### ✅ Base64 Rejection
- **Rejects base64 images** (3-6× token waste)
- **Requires Cloudinary URLs** only
- Saves 70-80% on token consumption

### 📊 Real Cost Comparison

| Setup | Cost per Image | Images per $5 |
|-------|----------------|---------------|
| **Free Model + Cloudinary URL** | $0.00 | ∞ |
| **Paid Model + Cloudinary URL (512px)** | $0.0004 | ~12,500 |
| **Paid Model + Base64 (original)** | $0.003-$0.01 | ~500-1,600 |

---

## 🧪 Testing Both Models

```bash
# Test free model
USE_FREE_AI_MODEL=true npm run dev

# Test paid model  
USE_FREE_AI_MODEL=false npm run dev
```

Monitor your OpenRouter dashboard to see actual costs.
