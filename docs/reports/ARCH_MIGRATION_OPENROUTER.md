
# 🧠 AI Architecture Evolution Report: "The OpenRouter Migration"
**Date:** December 9, 2025
**Final Status:** ✅ Stable (Production Ready)

## 📌 Executive Summary
We successfully migrated the entire AI infrastructure of Capsera from a complex, failure-prone multi-key rotation system to a robust, single-pipeline architecture using **OpenRouter**. This decision solved user-facing `503 Service Unavailable` errors and bypassed Google Cloud's restrictive billing issues for Indian cards.

---

## 🛑 Phase 1: The "Free Tier" Nightmare (The Problem)
**Initial Strategy:** Use Google Gemini 1.5 Flash Free Tier.
*   **The Constraint:** Google allows only **15 requests per minute (RPM)** on the free tier.
*   **The Hack:** We implemented `SmartGeminiManager`, a complex system that rotated through 4+ different Google API keys to "trick" the rate limit.
*   **The Failure Point:**
    1.  Concurrent users easily exhausted all 4 keys instantly.
    2.  Logic became bloated with retries, exhausted-key tracking, and health checks.
    3.  **Result:** Users saw `503 Service Unavailable (At Capacity)` constantly.

## 🚧 Phase 2: The "Billing" Roadblock
**Proposed Strategy:** Switch to Gemini Paid Tier (Cheap & Fast).
*   **The Plan:** Enabling billing removes the RPM limit (1000+ RPM).
*   **The Blocker:** Google Cloud consistently rejected valid Indian debit/credit cards due to RBI e-mandate regulations, making it impossible to enable a paid account.

## 🚀 Phase 3: The OpenRouter Solution (The Ultimatum)
**Final Strategy:** Bypass Google Direct & Use OpenRouter Aggregator.

### Why OpenRouter?
1.  **Payment Flexibility:** They accept prepaid credits (Crypto/Cards), bypassing simple recurrence checks that fail on Google.
2.  **Free Tier Access:** They offer `google/gemini-2.0-flash-exp:free` which is high-quality and currently $0.00.
3.  **Unified API:** One key gives access to Gemini, Llama, Claude, etc. No more rotation logic needed.

### 🐛 The Critical Bug We Faced
When we first switched to OpenRouter using the `genkitx-openai` plugin, we hit a **503 Error** again.
*   **Root Cause:** The Genkit library tried to "validate" the model name `google/gemini-2.0-flash-exp:free` against its internal list of known OpenAI models. Since it's a Google model, the library blocked the request locally before sending it!
*   **The Fix:** We rewrote the core generation logic (`generate-caption.ts`) to use a **Direct `fetch()` Call**, completely bypassing the strict library validation.

---

## 🛠️ Technical Implementation Details

### 1. Simplified Architecture
We deleted over **200 lines of code** related to:
*   ❌ Key Rotation (`SmartGeminiManager`)
*   ❌ Groq Fallbacks (`generateGroqCaptions`)
*   ❌ Retry Loops

### 2. New Folder Structure & Logic
*   **`src/ai/flows/generate-caption.ts`**:
    *   Now uses raw `fetch('https://openrouter.ai/api/v1/chat/completions')`.
    *   Manually constructs the JSON payload.
    *   Directly parses the response.
*   **`src/ai/genkit.ts`**:
    *   Configured purely for OpenRouter (just in case future flows use Genkit).

### 3. Cost & Limits (The Reality)
*   **Current Model:** `google/gemini-2.0-flash-exp:free`
*   **Cost:** **$0.00** (Totally Free).
*   **Capacity:** ~50 requests/day (Free Tier) or Unlimited if we add $5 credit to OpenRouter.
*   **Reliability:** 99.9% (OpenRouter is very stable).

---

## 🎓 Lessons Learned
1.  **Libraries can be blockers:** Sometimes "smart" libraries like Genkit prevent you from using new/experimental features because of strict validation. "Dumb" `fetch` calls are often more flexible.
2.  **Aggregators > Direct:** dealing with individual provider billing (Google/AWS) is painful. Aggregators like OpenRouter solve the "access" problem instantly.
3.  **Simplicity Wins:** Removing the key rotation logic made the code faster, readable, and less prone to bugs.
