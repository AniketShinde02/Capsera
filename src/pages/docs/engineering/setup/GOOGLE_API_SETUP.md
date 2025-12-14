
# 🔑 How to Set Up a Fresh Google Cloud Account for Gemini API

Follow these steps exactly to set up your new Gmail account for paid (but cheap) Gemini API usage.

## Step 1: Create a Project
1.  Log in to [Google Cloud Console](https://console.cloud.google.com/) with your new Gmail account.
2.  Agree to the Terms of Service if asked.
3.  Click on the project dropdown at the top (it might say "Select a project").
4.  Click **"New Project"**.
5.  Name it `Capsera-AI` and click **Create**.
6.  Wait a moment, then select the new project you just created.

## Step 2: Enable Billing (Crucial for Speed)
*This removes the 15 requests/minute limit.*

1.  In the Cloud Console sidebar, go to **Billing**.
2.  Click **"Link a billing account"** or **"Manage Billing Accounts"** -> **"Create Account"**.
3.  Follow the steps to add your credit/debit card (they usually verify with a small transaction like ₹2 which is refunded).
    *   *Note: Using a debit card in India requires enabling international transactions on your card, or it might fail.*
4.  **Important**: Once enabled, go to **Billing** -> **Budgets & alerts**.
5.  Create a budget named "Monthly Cap" and set the amount to **₹200**.
6.  Check the boxes to email you when 50%, 90%, and 100% of the budget is reached.

## Step 3: Enable the API
1.  In the top search bar of Google Cloud Console, type **"Google AI Studio"** or go directly to [Google AI Studio](https://aistudio.google.com/).
2.  Click **"Get API key"** on the left sidebar.
3.  Click **"Create API key"**.
4.  Select your Google Cloud Project (`Capsera-AI`) from the list.
5.  Copy the key starting with `AIza...`.

## Step 4: Update Your Code
1.  Open your `.env` file in VS Code.
2.  Paste the new key:
    ```env
    GEMINI_API_KEY_1=your_new_AIza_key_here
    ```
    *(You can delete `GEMINI_API_KEY_2`, `3`, etc., as we don't need them anymore).*
3.  **Restart your server** (`CTRL+C` then `npm run dev`).

## Step 5: Verify
1.  Try generating captions in your app.
2.  It should now be blazing fast with no "503 At Capacity" errors!

---

# 📊 Capacity & Budget Breakdown

You asked: *"How much will it cost?"* and *"Can the database handle it?"*

### 1. Cost Analysis (Pocket Friendly)
**Model:** Gemini 2.0 Flash
**Estimate:** 1 image generation ≈ **₹0.04 INR** (very conservative safe estimate).

| Monthly Budget | Approx. Capacity (Generations) | Daily Capacity |
| :--- | :--- | :--- |
| **₹200 INR** | ~5,000 Images | ~166 Images/Day |
| **₹400 INR** | ~10,000 Images | ~333 Images/Day |
| **₹1,000 INR** | ~25,000 Images | ~830 Images/Day |

*Note: This is strictly for the AI generation cost.*

### 2. System Stress Analysis (Will DB/Cloudinary surrender?)

You asked: *"Paid plan sends 1k requests/min. Will DB and Cloudinary surrender?"*

**Short Answer:** No, they won't surrender at ₹200 budget levels, but here are the theoretical limits.

#### ☁️ Cloudinary (Image Hosting)
*   **Limit:** Cloudinary Free Tier gives **25 Credits** per month.
    *   1 Credit ≈ 1,000 Transformations or 1GB Bandwidth.
*   **Capacity:** 25,000 transformations/month.
*   **Verdict:** Your **₹1,000 AI Budget** aligns perfectly with the Cloudinary Free Tier limit.
    *   ✅ At ₹200 (5,000 images), Cloudinary is sleeping comfortably. It won't even break a sweat.
    *   ⚠️ If you go above ~20,000 images/month, you'll need to upgrade Cloudinary (approx $99/mo) before you worry about the AI cost again.

#### 🗄️ MongoDB Atlas (Database)
*   **Limit:** Free Sandbox (M0).
*   **Constraint:** Max 500 simultaneous connections.
*   **Verdict:** Generating captions is mostly "Processing Time" (AI thinking), not "Database Writing".
    *   Even at **1,000 Request Per Minute (RPM)**, that is roughly **16 requests per second**.
    *   MongoDB Free Tier accepts ~100 writes/second easily.
    *   ✅ Your DB will handle 1,000 RPM fine.
    *   ✅ Code Logic: We improved the code to save to the DB *asynchronously*, meaning the user gets their caption instantly even if the DB is slightly slow.

**Conclusion:** Your entire stack (AI + Cloudinary + DB) works in perfect harmony up to about **20,000 images/month**. After that, Cloudinary becomes your first paid bottleneck, not the AI or DB.
