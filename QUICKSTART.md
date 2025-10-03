# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Installation
The development server is already running at: **http://localhost:3000**

Open your browser and visit the homepage.

### Step 2: Create Your First Contest

1. **Navigate to Admin Panel**:
   - Click "Admin Panel" in the navigation bar
   - Or visit: http://localhost:3000/admin

2. **Click "Create New Contest"**

3. **Fill in Contest Details**:
   ```
   Title: My First Contest
   Description: A beginner-friendly programming contest
   Start Time: (select current date/time)
   End Time: (select a time 2-3 hours from now)
   ```

4. **Add a Problem**:
   - Click "Add Problem"
   - Fill in:
     ```
     Title: Sum Two Numbers
     Description: Given two integers, output their sum
     Difficulty: Easy
     Points: 100
     Time Limit: 5 seconds
     ```
   - Add 5 test cases:
     ```
     Test Case 1: Input: "5 3"    Output: "8"
     Test Case 2: Input: "10 20"  Output: "30"
     Test Case 3: Input: "0 0"    Output: "0"
     Test Case 4: Input: "-5 5"   Output: "0"
     Test Case 5: Input: "100 50" Output: "150"
     ```

5. **Click "Create Contest"**

### Step 3: Join the Contest

1. **Copy the Contest URL**:
   - In the admin panel, click "Copy URL" button
   - The URL will look like: `http://localhost:3000/contest/[some-id]`

2. **Open in New Tab** (or Incognito for testing):
   - Visit the homepage: http://localhost:3000
   - Enter your name: "John Doe"
   - Paste the contest URL or ID
   - Click "Join Contest"

### Step 4: Solve a Problem

1. **Select the Problem** from the left sidebar

2. **Choose Your Language**: Python, JavaScript, Java, C++, or C

3. **Write Your Solution**:
   ```python
   # Python example
   a, b = map(int, input().split())
   print(a + b)
   ```

4. **Test Your Code**:
   - Enter test input in the "Test Input" field: `5 3`
   - Click "Run Code"
   - Verify output: `8`

5. **Submit**:
   - Click "Submit" button
   - Your solution will be evaluated against all test cases

### Step 5: Check the Leaderboard

1. Click "Leaderboard" button in the navigation
2. See your ranking, points, and solve time
3. Watch real-time updates as others submit

---

## 🎯 Quick Tips

### For Administrators:
- Access admin panel at: `/admin`
- You can create multiple contests
- Copy contest URLs to share with participants
- Monitor leaderboards in real-time

### For Contestants:
- No registration required - just enter your name
- Choose from 5 programming languages
- Test your code before submitting
- Each problem has 5 test cases
- Full points awarded when all test cases pass
- Faster solve time = better ranking

### Sample Code Templates:

**Python:**
```python
# Read input
n = int(input())
# or for multiple values:
a, b = map(int, input().split())

# Process and print output
print(result)
```

**JavaScript:**
```javascript
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    console.log(input);
    rl.close();
});
```

**Java:**
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n);
    }
}
```

**C++:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n << endl;
    return 0;
}
```

---

## 📖 Next Steps

1. **Review Sample Problems**: Check `SAMPLE_PROBLEMS.md` for ready-to-use problem examples
2. **Deploy to Vercel**: See `DEPLOYMENT.md` for hosting instructions
3. **Customize**: Modify styles, add features, integrate real code execution

---

## ⚠️ Important Notes

1. **Code Execution**: Currently using mock implementation
   - For production, integrate Judge0 or Piston API
   - See `src/lib/codeExecution.ts` for implementation

2. **Data Storage**: In-memory storage
   - Data resets when server restarts
   - Consider adding a database for production

3. **Authentication**: Simple name-based system
   - No passwords or security
   - Suitable for internal contests only

---

## 🐛 Troubleshooting

**Contest not appearing?**
- Make sure you clicked "Create Contest" button
- Refresh the contests page

**Code not executing?**
- The mock implementation has limitations
- Check console for errors
- Integrate real code execution API for production

**Leaderboard not updating?**
- It refreshes every 10 seconds automatically
- Manually refresh the page if needed

---

## 🎉 You're Ready!

Your contest platform is now fully functional. Start creating contests and invite your friends to compete!

For more information:
- Read `README.md` for detailed documentation
- Check `SAMPLE_PROBLEMS.md` for problem ideas
- Review `DEPLOYMENT.md` for hosting options
