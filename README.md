# 🎨 Capsera: AI-Powered Social Media Caption Generator

> **Current Status**: Active Development 🛠️

**Transform your social media presence with intelligent, image-aware caption generation powered by OpenRouter (GPT-4o-mini & Llama Vision).**

<div align="center">

![Capsera Banner](screenshots/capsera_banner.png)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-purple?style=for-the-badge&logo=openai)](https://openrouter.ai/)

**🎯 Perfect captions • 🚀 Boost engagement • ✨ Save time • 📈 Grow your audience**

[✨ **Live Demo**](https://capsera.online/) • [📚 **Documentation**](https://capsera-docs.vercel.app/) • [🚀 **Deploy Now**](#-deployment-guide)

</div>

---

## 🌟 What Makes Capsera Special?

Capsera isn't just another caption generator – it's your **AI-powered creative partner** that actually *sees* and *understands* your images.

### 🎯 **Key Differentiators:**
- **🤖 Resilient AI System**: **OpenRouter** integration using `gpt-4o-mini` as primary, with `qwen-vl` and `llama-3.2` as intelligent fallbacks.
- **🛡️ Spend Control**: Built-in daily spend limits per user ($0.50/day) to prevent API cost runaways.
- **📋 Paste-to-Upload**: Copy & paste images directly (Ctrl+V) from your clipboard.
- **🎨 Mood-Driven Generation**: 40+ different moods ("Sassy", "Professional", "Zen", etc.) for perfect tone matching.
- **🔄 Smart Rate Limiting**: Layered "Consolidated Rate Limiter" with daily quotas, weekly grace periods, and IP-based security.
- **🔐 Dual-Mode Admin**: Admins can browse as regular users while retaining admin privileges (Unified Login).
- **🗑️ Smart Image Handling**: Automatic Cloudinary optimization (512px, eco-quality) to minimize token costs.
- **📱 Mobile-First**: Fully responsive "Magic UI" design with glassmorphism and smooth animations.

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Components**: Radix UI + Lucide Icons
- **Forms**: React Hook Form + Zod

### **Backend & AI**
- **AI Engine**: OpenRouter API (GPT-4o-mini, Qwen, Llama)
- **Database**: MongoDB + Mongoose (Schema-optimized)
- **Authentication**: NextAuth.js (JWT Strategy)
- **Image Storage**: Cloudinary (Auto-optimization)
- **Email**: Brevo SMTP

---

## 🚀 **Quick Start**

```bash
# Clone the repository
git clone https://github.com/AniketShinde02/capsera.git
cd capsera

# Install dependencies
npm install

# Set up environment variables
cp docs/env.example .env.local
# Edit .env.local with your OpenRouter & MongoDB keys

# Run development server
npm run dev
```

---

## 🔒 **Security Features**

- **Consolidated Rate Limiting**: Multi-layer protection (IP + User ID) preventing abuse.
- **Spend Caps**: Hard limits on daily AI spend ($0.50) enforced at the API route level.
- **Input Validation**: Strict Zod schemas for all API inputs.
- **Secure Info**: No hardcoded secrets; full environment variable usage.
- **Maintenance Mode**: Database-driven maintenance mode (admin-bypass capable).

---

## ⚡ **Performance**

- **Image Optimization**: Cloudinary transformations reduce image size by ~90% before AI processing.
- **Cost Awareness**: Rejects Base64 images to save tokens; enforces 512px width.
- **Caching**: MongoDB-based caption caching to serve repeat requests instantly.
- **Edge Compatible**: Optimized for Vercel deployment.

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 **License**

This project is licensed under the MIT License.

---

## 👨‍💻 **About the Creator**

**Aniket Shinde** - Building the future of AI-powered social tools.

- **GitHub**: [@AniketShinde02](https://github.com/AniketShinde02)
- **Twitter**: [@24_jinwoo](https://twitter.com/24_jinwoo)
