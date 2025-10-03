# Quick Testing Guide

Your development server is running at **http://localhost:3000**

All requested features have been implemented! Here's how to test them:

---

## 🧪 Feature Testing Checklist

### 1. Test Problem Limit (Max 10 Problems)

1. Go to http://localhost:3000/admin
2. Click **"Create New Contest"**
3. Fill in contest details
4. Click **"Add Problem"** repeatedly
5. **Expected**: After 10 problems, button becomes gray and shows "(Max reached)"
6. Try clicking it again → Alert: "Maximum 10 problems allowed per contest"

**Status Counter**: Should show "10/10 problems added"

---

### 2. Test Hidden Test Cases (Only First One Shown)

1. Create a problem with 5 test cases
2. Save the contest and copy URL
3. Go to homepage, enter your name, paste contest URL
4. **Expected**: Under "Sample Test Case" section, you'll see:
   - Only 1 example test case (not all 5)
   - Note: "Your solution will be tested against 5 hidden test cases. All must pass to get full points."

---

### 3. Test Output Display (Works for Both Success and Error)

#### Test Success Output:
1. Join a contest with "Sum Two Numbers" problem
2. Select Python
3. Write correct code:
```python
a = int(input())
b = int(input())
print(a + b)
```
4. Enter test input: `5\n3`
5. Click **"Run Code"**
6. **Expected**: 
```
✓ Success:
8

Execution Time: 23ms
```

#### Test Error Output:
1. Write incorrect code:
```python
print(x)  # x is not defined
```
2. Click **"Run Code"**
3. **Expected**:
```
✗ Error:
Runtime Error:
NameError: name 'x' is not defined

Execution Time: 15ms
```

---

### 4. Test All-or-Nothing Scoring

#### Test Partial Pass (Should Get 0 Points):
1. Create problem: "Print Even Numbers from 1 to N"
2. Add 5 test cases with different inputs
3. Write code that only works for some test cases
4. Submit
5. **Expected**: "Test Cases: 3/5 passed, Points: 0/100"

#### Test Full Pass (Should Get All Points):
1. Write code that passes all test cases
2. Submit
3. **Expected**: "Test Cases: 5/5 passed, Points: 100/100"

---

### 5. Test Free Problem Selection

1. Create contest with 3+ problems
2. Join the contest
3. **Expected**: See all problems in left sidebar
4. Click any problem → Should switch to it immediately
5. Solve them in any order you want
6. **Expected**: Green checkmark ✓ appears on solved problems

---

### 6. Test Submission History

1. Submit code for a problem (any result)
2. Wait 3-5 seconds
3. **Expected**: "Your Submissions" section appears below the problem description
4. Submit again with different code
5. **Expected**: New submission appears at top with:
   - Color-coded status badge
   - Time of submission
   - Test cases passed (X/Y)
   - Points earned
   - Programming language

**Color Codes:**
- 🟢 Green = Accepted
- 🔵 Blue = Running
- 🟠 Orange = Compilation Error
- 🔴 Red = Wrong Answer/Runtime Error

---

### 7. Test Confirmation Dialog

1. Write some code
2. Click **"Submit"**
3. **Expected**: Confirmation dialog appears:
```
Submit your solution for "Problem Name"?

Your code will be tested against 5 test cases.
You will earn 100 points only if ALL test cases pass.

[Cancel] [OK]
```
4. Click OK → Submission created
5. Click Cancel → Nothing happens

---

## 🎯 Complete Test Flow

### Create a Full Contest:

1. **Admin Panel** (http://localhost:3000/admin)
   - Create "Test Contest"
   - Add 5 problems:
     1. Sum Two Numbers (Easy, 100 pts)
     2. Find Maximum (Easy, 100 pts)
     3. Reverse String (Medium, 200 pts)
     4. Fibonacci (Medium, 200 pts)
     5. Prime Numbers (Hard, 300 pts)
   
2. **Copy Contest URL**

3. **Test as Contestant:**
   - Go to homepage
   - Enter name: "TestUser"
   - Paste contest URL
   - Try solving problems in any order
   - Test Run Code with correct and incorrect code
   - Submit solutions
   - Check submission history
   - View leaderboard

---

## 📊 Sample Problems to Test

### Problem 1: Sum Two Numbers (100 points)
```
Description: Read two integers and print their sum.

Test Case 1: Input: 5\n3  → Output: 8
Test Case 2: Input: 10\n20 → Output: 30
Test Case 3: Input: -5\n5 → Output: 0
Test Case 4: Input: 0\n0 → Output: 0
Test Case 5: Input: 100\n200 → Output: 300
```

**Python Solution:**
```python
a = int(input())
b = int(input())
print(a + b)
```

### Problem 2: Find Maximum (100 points)
```
Description: Read N numbers and print the maximum.

Test Case 1: Input: 3\n1\n5\n3 → Output: 5
Test Case 2: Input: 4\n10\n20\n15\n8 → Output: 20
Test Case 3: Input: 2\n-5\n-10 → Output: -5
Test Case 4: Input: 1\n42 → Output: 42
Test Case 5: Input: 5\n1\n2\n3\n4\n5 → Output: 5
```

**Python Solution:**
```python
n = int(input())
numbers = []
for i in range(n):
    numbers.append(int(input()))
print(max(numbers))
```

---

## ✅ Expected Behavior Summary

| Feature | Expected Behavior |
|---------|-------------------|
| Problem Limit | Max 10 per contest, button disabled after |
| Test Cases | Only 1st shown, others hidden |
| Scoring | 0 points if any test fails, full points if all pass |
| Output Display | Shows for both success and errors with emojis |
| Problem Selection | Free choice, click any problem anytime |
| Submission History | Shows all attempts with color-coded status |
| Confirmation | Dialog before each submission |
| Judge0 Integration | Real code execution with actual results |

---

## 🐛 If Something Doesn't Work

1. **Check browser console** for errors (F12)
2. **Refresh the page** after making changes
3. **Clear localStorage** if needed: `localStorage.clear()`
4. **Check terminal** for backend errors
5. **Verify .env.local** has correct API keys

---

## 🚀 All Features Working!

Your platform now has:
- ✅ Real code execution (Judge0 API)
- ✅ Up to 10 problems per contest
- ✅ Hidden test cases (only 1 example shown)
- ✅ All-or-nothing scoring
- ✅ Output display for all cases
- ✅ Free problem selection
- ✅ Submission history
- ✅ Confirmation dialogs
- ✅ PostgreSQL database
- ✅ Real-time leaderboard
- ✅ 5 programming languages

**Ready to host your first coding contest! 🎉**
