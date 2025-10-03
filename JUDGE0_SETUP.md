# Judge0 API Setup Guide

This guide will help you integrate Judge0 API for real code execution in your contest platform.

## What is Judge0?

Judge0 is a robust, scalable, and open-source online code execution system. It can compile and run source code in 60+ programming languages.

## Getting Started

### Step 1: Sign Up for RapidAPI

1. Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click **"Sign Up"** (top right) if you don't have an account
3. Choose your authentication method (Google, GitHub, or Email)

### Step 2: Subscribe to Judge0 CE

1. Once logged in, you'll see the Judge0 CE API page
2. Click on the **"Pricing"** tab
3. Choose a plan:
   - **Basic (FREE)**: 50 requests/day - Good for testing
   - **Pro ($10/month)**: 1,000 requests/day - Good for small contests
   - **Ultra ($50/month)**: 10,000 requests/day - Good for production
   - **Mega ($300/month)**: 100,000 requests/day - Enterprise level

4. Click **"Subscribe"** on your chosen plan

### Step 3: Get Your API Key

1. After subscribing, go to the **"Endpoints"** tab
2. You'll see your API key in the code snippets section
3. Look for the header: `X-RapidAPI-Key: YOUR_API_KEY_HERE`
4. Copy this key

### Step 4: Configure Your Application

1. Open your `.env.local` file in the project root
2. Replace the placeholder with your actual API key:

```env
RAPIDAPI_KEY=your_actual_api_key_here
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

3. **Important**: Never commit your `.env.local` file to git!

### Step 5: Restart Your Development Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Supported Languages

The platform currently supports these languages with Judge0:

| Language   | Judge0 ID | Version           |
|------------|-----------|-------------------|
| Python     | 71        | 3.8.1             |
| JavaScript | 63        | Node.js 12.14.0   |
| Java       | 62        | OpenJDK 13.0.1    |
| C++        | 54        | GCC 9.2.0         |
| C          | 50        | GCC 9.2.0         |

## Testing the Integration

1. **Create a Test Contest** in the admin panel
2. **Add a simple problem** like "Add Two Numbers"
   - Input: `5\n3`
   - Expected Output: `8`
3. **Join the contest** and submit code:

### Python Example
```python
a = int(input())
b = int(input())
print(a + b)
```

### JavaScript Example
```javascript
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
  lines.push(line);
  if (lines.length === 2) {
    const a = parseInt(lines[0]);
    const b = parseInt(lines[1]);
    console.log(a + b);
    rl.close();
  }
});
```

### Java Example
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(a + b);
        scanner.close();
    }
}
```

## How It Works

### Execution Flow

1. **User submits code** → Frontend sends to `/api/submissions`
2. **Backend receives** → Creates submission record in database
3. **Code execution** → Sends to Judge0 API with test cases
4. **Judge0 processes**:
   - Compiles code (if needed)
   - Runs against each test case
   - Returns results
5. **Scoring** → Backend calculates points based on passed test cases
6. **Update database** → Stores results and updates leaderboard

### API Request Flow

```
Your Server → Judge0
POST /submissions
{
  "source_code": "base64_encoded_code",
  "language_id": 71,
  "stdin": "base64_encoded_input"
}

Judge0 → Your Server
{
  "token": "submission_token"
}

Your Server → Judge0 (polling)
GET /submissions/{token}

Judge0 → Your Server
{
  "status": { "id": 3 },  // 3 = Accepted
  "stdout": "base64_output",
  "time": "0.001",
  "memory": 3456
}
```

## Status Codes

Judge0 returns these status codes:

| ID | Status                    | Description                          |
|----|---------------------------|--------------------------------------|
| 1  | In Queue                  | Submission waiting to be processed   |
| 2  | Processing                | Currently executing                  |
| 3  | Accepted                  | ✅ Correct output                    |
| 4  | Wrong Answer              | ❌ Output doesn't match expected     |
| 5  | Time Limit Exceeded       | ⏱️ Took too long                     |
| 6  | Compilation Error         | 🔨 Code doesn't compile              |
| 11 | Runtime Error (SIGSEGV)   | 💥 Segmentation fault                |
| 12 | Runtime Error (SIGXFSZ)   | 💥 File size limit exceeded          |
| 13 | Runtime Error (SIGFPE)    | 💥 Floating point exception          |
| 14 | Runtime Error (SIGABRT)   | 💥 Process aborted                   |

## Troubleshooting

### "Judge0 API not configured" Message

**Problem**: You see a warning message instead of execution results.

**Solution**: 
- Check that `RAPIDAPI_KEY` in `.env.local` is set
- Ensure it's not the placeholder value `your_rapidapi_key_here`
- Restart the development server

### "Submission failed: 429 Too Many Requests"

**Problem**: You've exceeded your daily quota.

**Solution**:
- Wait 24 hours for quota reset
- Upgrade your RapidAPI plan
- Or use Judge0 self-hosted (free but requires server)

### "Execution timeout"

**Problem**: Code takes too long to execute.

**Solution**:
- Check for infinite loops in submitted code
- Optimize the algorithm
- Increase `cpu_time_limit` in `src/lib/codeExecution.ts` (currently 2 seconds)

### Compilation Errors

**Problem**: Code won't compile.

**Solution**:
- Check the error message in the submission details
- For Java: ensure class name is `Main`
- For C/C++: ensure proper includes and syntax

## Cost Estimation

### Free Tier (50/day)
- Good for: Testing and small hackathons
- ~2-3 contestants with 5 problems each

### Pro Tier ($10/month = 1,000/day)
- Good for: Regular contests
- ~40 contestants with 5 problems each
- Multiple test runs per problem

### Ultra Tier ($50/month = 10,000/day)
- Good for: Large contests
- ~400 contestants with 5 problems each
- Extensive testing

**Note**: Each problem submission runs 5 test cases = 5 API calls

## Alternative: Self-Hosted Judge0

If you need unlimited executions:

1. Host Judge0 on your own server (DigitalOcean, AWS, etc.)
2. Follow: https://github.com/judge0/judge0
3. Update `RAPIDAPI_HOST` in `.env.local` to your server URL
4. Remove RapidAPI authentication headers in `src/lib/codeExecution.ts`

**Requirements**:
- Docker & Docker Compose
- 2GB RAM minimum
- Linux server (Ubuntu recommended)

## Security Notes

✅ **What's Protected**:
- Code runs in isolated containers
- Time limits prevent infinite loops
- Memory limits prevent memory bombs
- No network access from execution environment

⚠️ **Best Practices**:
- Never expose your API key in frontend code
- Keep `.env.local` out of version control
- Monitor your API usage regularly
- Set up rate limiting on your endpoints

## Deployment to Vercel

When deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `RAPIDAPI_KEY`
   - `RAPIDAPI_HOST`

2. Vercel automatically loads these as `process.env.*`

3. Redeploy after adding variables

## Support

- **Judge0 Documentation**: https://ce.judge0.com/
- **RapidAPI Support**: https://rapidapi.com/support
- **Language IDs List**: https://ce.judge0.com/languages

## Summary

✅ Sign up at RapidAPI
✅ Subscribe to Judge0 CE (Free or Paid)
✅ Copy your API key
✅ Update `.env.local`
✅ Restart server
✅ Test with a simple problem
✅ Deploy to production

Your contest platform is now ready for real code execution! 🚀
