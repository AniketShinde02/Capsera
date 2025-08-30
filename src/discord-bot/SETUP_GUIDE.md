# 🚀 **Capsera Discord Bot - Separate Setup Guide**

**Complete guide to run Discord bot independently from main site**

**✨ Now with Conversational AI & Enhanced Channel Management!**

---

## 📁 **Step 1: Create Separate Directory**

```bash
# Go to parent directory (outside main project)
cd ..

# Create new directory for Discord bot
mkdir Capsera-bot

# Navigate to new directory
cd Capsera-bot
```

**Your new structure will be:**
```
D:\
├── Caption generator\          # Main site (untouched)
│   ├── src\
│   ├── package.json
│   └── .env
│
└── Capsera-bot\                # Discord bot (separate)
    ├── src\discord-bot\
    ├── package.json
    └── .env
```

---

## 🆕 **Latest Features (v1.2.0)**

### **🤖 Conversational AI**
- **Smart Question Answering**: Ask "What is Capsera?", "How to use?", "What moods?", etc.
- **Instant Responses**: Get help and information immediately
- **Rich Information**: Beautiful embeds with organized content
- **Educational Content**: Learn about AI technology and Capsera

### **📺 Enhanced Channel Management**
- **Copy Individual Captions**: Easy copying with clear instructions
- **Send to Current Channel**: Share all captions publicly
- **Choose Target Channel**: Select specific channels from numbered list
- **Smart Channel Discovery**: Bot finds all accessible channels automatically

### **🎯 Improved User Experience**
- **Progressive Updates**: Real-time status during processing
- **Better Copy System**: Clear manual copy instructions
- **Interactive Buttons**: Enhanced caption management
- **Error Handling**: Graceful fallbacks and user feedback

---

## 📋 **Step 2: Copy Required Files**

### **Copy Discord Bot Source:**
```bash
# Copy the entire discord-bot folder
xcopy "D:\Caption generator\src\discord-bot" "src\discord-bot\" /E /I /H

# Copy package.json
copy "D:\Caption generator\package.json" "package.json"

# Copy .env file
copy "D:\Caption generator\.env" ".env"
```

---

## 📦 **Step 3: Create Discord-Specific Package.json**

**Replace the copied package.json with this Discord-specific version:**

```json
{
  "name": "capsera-discord-bot",
  "version": "1.0.0",
  "description": "AI-Powered Social Media Caption Generator for Discord",
  "main": "src/discord-bot/start.ts",
  "scripts": {
    "start": "tsx src/discord-bot/start.ts",
    "dev": "tsx --watch src/discord-bot/start.ts",
    "build": "tsc src/discord-bot/start.ts --outDir dist/discord-bot",
    "discord:start": "tsx src/discord-bot/start.ts",
    "discord:dev": "tsx --watch src/discord-bot/start.ts",
    "discord:build": "tsc src/discord-bot/start.ts --outDir dist/discord-bot"
  },
  "keywords": [
    "discord",
    "bot",
    "ai",
    "captions",
    "social-media",
    "gemini"
  ],
  "author": "Capsera Team",
  "license": "MIT",
  "dependencies": {
    "discord.js": "^14.14.1",
    "@google/generative-ai": "^0.2.1",
    "mongoose": "^8.0.0",
    "dotenv": "^16.0.0",
    "tsx": "^4.19.2"
  },
  "devDependencies": {
    "@types/node": "^22.17.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🔑 **Step 4: Environment Variables (.env)**

**Create a new .env file with ONLY Discord bot variables:**

```env
# ========================================
# CAPSERA DISCORD BOT - COMPLETE ENVIRONMENT
# ========================================

# Discord Bot Settings
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# AI Configuration (Gemini API Keys)
# Option 1: Combined keys (recommended)
DISCORD_GEMINI_KEYS=your_gemini_api_key_1,your_gemini_api_key_2,your_gemini_api_key_3

# Option 2: Individual API Keys (if you prefer)
GEMINI_API_KEY_1=your_gemini_api_key_1_here
GEMINI_API_KEY_2=your_gemini_api_key_2_here
GEMINI_API_KEY_3=your_gemini_api_key_3_here
GEMINI_API_KEY_4=your_gemini_api_key_4_here

# Database Configuration (Separate from main site)
DISCORD_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DISCORD_DB_NAME=capsera_discord

# ========================================
# OPTIONAL: Cloudinary (if you want image storage)
# ========================================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ========================================
# NOTE: Remove all main site variables
# ========================================
# DO NOT include: MONGODB_URI, NEXTAUTH_URL, etc.
# Only Discord bot specific variables
```

**⚠️ SECURITY NOTE: Replace all "your_..." values with your actual credentials!**
**🔒 Never commit real API keys to version control!**

---

## 🛠️ **Step 5: Install Dependencies**

```bash
# Install Discord bot dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected output:**
```
├── @google/generative-ai@0.2.1
├── discord.js@14.14.1
├── dotenv@16.0.0
├── mongoose@8.0.0
└── tsx@4.19.2
```

---

## 🚀 **Step 6: Run Discord Bot**

### **Development Mode (Auto-restart):**
```bash
npm run discord:dev
```

### **Production Mode:**
```bash
npm run discord:start
```

### **Build for Production:**
```bash
npm run discord:build
```

---

## ✅ **Step 7: Verify Everything Works**

**Expected console output:**
```
Loading .env from: D:\Capsera-bot\.env
🔍 Discord Bot Environment Check:
DISCORD_BOT_TOKEN: ✅ Set
DISCORD_CLIENT_ID: ✅ Set
DISCORD_MONGODB_URI: ✅ Set (Separate DB)
DISCORD_DB_NAME: capsera_discord
DISCORD_GEMINI_KEYS: ✅ Set (Separate Keys)
🚀 Starting Discord Bot...
✅ Connected to Discord-specific MongoDB
✅ Slash commands registered successfully with Discord API
✅ Discord Bot started successfully!
```

---

## 🔧 **Step 8: Test Commands**

1. **Go to your Discord server**
2. **Use `/caption` command**
3. **Upload an image**
4. **Select a mood**
5. **Verify captions are generated**

---

## 📁 **Final Directory Structure**

```
D:\Capsera-bot\
├── src\
│   └── discord-bot\
│       ├── start.ts
│       ├── bot.ts
│       ├── handlers\
│       │   └── commandHandler.ts
│       ├── ai\
│       │   └── discord-caption-generator.ts
│       ├── config\
│       │   ├── database.ts
│       │   └── gemini-keys.ts
│       ├── database\
│       │   └── DiscordCaption.ts
│       ├── utils\
│       │   └── discord-rate-limiter.ts
│       ├── README.md
│       └── SETUP_GUIDE.md
├── package.json
├── .env
├── node_modules\
└── package-lock.json
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **2. Environment variables not loading:**
```bash
# Check .env file path
# Ensure .env is in root directory
# Verify variable names match exactly
```

#### **3. Discord bot not responding:**
```bash
# Check bot token
# Verify bot permissions
# Check Discord server invite
```

#### **4. Database connection issues:**
```bash
# Verify MongoDB URI
# Check network connectivity
# Verify database name
```

---

## 🎯 **Benefits of Separation**

✅ **Main site completely untouched**
✅ **Discord bot runs independently**
✅ **No dependency conflicts**
✅ **Easy to deploy separately**
✅ **Clean code organization**
✅ **Independent version control**
✅ **No risk of breaking main site**

---

## 📞 **Support**

**If you encounter issues:**
1. **Check console logs** for error messages
2. **Verify environment variables** are set correctly
3. **Ensure all dependencies** are installed
4. **Check Discord bot permissions** in your server

---

## 🎉 **Congratulations!**

**Your Discord bot is now completely separate from your main site!**

**You can now:**
- Modify Discord bot code without affecting main site
- Deploy Discord bot independently
- Have different versions and dependencies
- Maintain clean separation of concerns

---

**Made with ❤️ by the Capsera Team**

*Transform your Discord server into a creative powerhouse with AI-powered caption generation!*
