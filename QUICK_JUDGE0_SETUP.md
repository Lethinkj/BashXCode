# 🚀 Quick Start: Enable Real Code Execution in 3 Minutes

## Current Status

Your platform works perfectly but uses **mock code execution**. Let's make it REAL!

## What You'll Get

**Before**: Submissions show "Mock execution" message
**After**: Code actually compiles and runs with real output!

## 3-Step Setup

### 📝 Step 1: Get API Key (2 minutes)

1. **Visit**: https://rapidapi.com/judge0-official/api/judge0-ce

2. **Sign Up**: Click "Sign Up" button (top right)
   - Use Google/GitHub/Email

3. **Subscribe to FREE Plan**:
   - Click "Pricing" tab
   - Click "Subscribe" on Basic (FREE) plan
   - Gets you 50 executions/day

4. **Copy API Key**:
   - Click "Endpoints" tab
   - Look for: `X-RapidAPI-Key: xxxxxxxxxxxxx`
   - Copy that key!

### ⚙️ Step 2: Configure (30 seconds)

Open `.env.local` in your project root and update:

```env
RAPIDAPI_KEY=paste_your_key_here
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

**Important**: No quotes around the key!

### 🔄 Step 3: Restart (10 seconds)

In your terminal:
1. Press `Ctrl + C` to stop server
2. Run: `npm run dev`
3. Done!

## Test It Works

### Quick Test (30 seconds)

1. Go to http://localhost:3000
2. Click "Browse all contests" or create one at `/admin`
3. Create a simple problem:
   - Title: "Hello World"
   - Input: *(empty)*
   - Expected Output: `Hello, World!`

4. Join and submit this Python code:
```python
print("Hello, World!")
```

5. Click **Submit Solution**

### Expected Result

If it works, you'll see:
```
✅ Test Case 1: Passed
✅ Test Case 2: Passed
✅ Test Case 3: Passed
✅ Test Case 4: Passed
✅ Test Case 5: Passed

Score: 100 points
Status: Accepted
Execution Time: 0.023s
```

If API not configured, you'll see:
```
⚠️ Judge0 API not configured
To enable real code execution:
1. Sign up at https://rapidapi.com...
```

## That's It!

You now have **REAL code execution**! 🎉

## Free Tier Limits

- **50 requests/day** = 10 submissions (5 test cases each)
- Perfect for testing
- Upgrade to Pro ($10/mo) for 1,000/day when ready

## What Just Happened?

Your code execution flow changed from:

```
Before:
Submit Code → Mock Response → Show "Mock execution"

After:
Submit Code → Judge0 API → Real Compilation → Real Execution → Real Results
```

## Supported Languages

Now working with REAL execution:
- ✅ Python 3.8
- ✅ JavaScript (Node.js)
- ✅ Java
- ✅ C++
- ✅ C

## Cost Reference

| Plan   | Price/month | Requests/day | Good For          |
|--------|-------------|--------------|-------------------|
| FREE   | $0          | 50           | Testing           |
| Pro    | $10         | 1,000        | Small contests    |
| Ultra  | $50         | 10,000       | Large hackathons  |

## Need Help?

- **Setup Problems**: See [JUDGE0_SETUP.md](./JUDGE0_SETUP.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Technical Details**: See [JUDGE0_INTEGRATION.md](./JUDGE0_INTEGRATION.md)

## Ready to Deploy?

Once you've tested locally:
1. Push to GitHub
2. Deploy to Vercel
3. Add same environment variables in Vercel dashboard
4. Go live!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

**That's all!** Your contest platform now executes real code. Time to host some contests! 🏆
