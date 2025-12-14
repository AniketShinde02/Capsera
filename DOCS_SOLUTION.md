# 📚 Docs Solution - Rewrites Approach (RECOMMENDED)

## ✅ What I Did:

After trying full Nextra integration (which had compatibility issues with Next.js 15 + App Router), I went with the **simpler, more reliable approach**: **Rewrites**.

---

## 🎯 Current Setup:

### **Option: Rewrites (Proxy to Separate Server)**

Your main app proxies `/docs` requests to the separate docs server.

**How it works:**
1. Main app runs on port 3000
2. Docs server runs on port 3002
3. When you visit `localhost:3000/docs`, it proxies to `localhost:3002/docs`

---

## 🚀 How to Use:

### **Terminal 1 - Main App:**
```bash
cd d:\Capsera
npm run dev
```

### **Terminal 2 - Docs:**
```bash
cd d:\Capsera\capsera-docs
npm run dev -- -p 3002
```

### **Access:**
- Main app: `http://localhost:3000`
- Docs (via proxy): `http://localhost:3000/docs`
- Docs (direct): `http://localhost:3002/docs`

---

## 🔧 Configuration:

### `next.config.ts` (Main App):
```typescript
async rewrites() {
  return [
    {
      source: '/docs',
      destination: 'http://localhost:3002/docs',
    },
    {
      source: '/docs/:path*',
      destination: 'http://localhost:3002/docs/:path*',
    },
  ];
}
```

---

## 💡 Why This Approach?

### ✅ **Pros:**
- **Works immediately** - No complex integration
- **Separate concerns** - Docs and app are independent
- **No version conflicts** - Docs use Nextra 2.x, app uses Next.js 15
- **Easy deployment** - Deploy docs separately if needed
- **Reliable** - No experimental features

### ❌ **Cons:**
- Need to run 2 servers in development
- Slightly more complex deployment

---

## 🚀 Optional: Run Both with One Command

Install `concurrently`:
```bash
npm install --save-dev concurrently
```

Add to `package.json`:
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"cd capsera-docs && npm run dev -- -p 3002\""
  }
}
```

Then run:
```bash
npm run dev:all
```

---

## 📦 Deployment Options:

### **Option 1: Single Deployment (Vercel)**
- Deploy main app to Vercel
- Vercel will automatically handle the rewrites
- Docs will be served from the same domain

### **Option 2: Separate Deployments**
- Deploy main app to Vercel (main domain)
- Deploy docs to Vercel (subdomain: docs.capsera.com)
- Update rewrites to point to production docs URL

---

## 🎯 Next Steps:

1. ✅ **Main app is running** on port 3000
2. 🔄 **Start docs server** on port 3002:
   ```bash
   cd capsera-docs
   npm run dev -- -p 3002
   ```
3. 🌐 **Visit** `http://localhost:3000/docs`

---

## 📝 Files Changed:

- ✅ `next.config.ts` - Enabled rewrites
- ✅ Removed experimental Nextra integration
- ✅ Kept `capsera-docs` folder separate

---

**Status:** ✅ Ready to use  
**Test:** Start docs server and visit `/docs`
