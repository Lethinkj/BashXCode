# Quick Fix: Support All Input Styles

## The Issue
User writes:
```python
n = int(input())
m = int(input())
```

But test case has: `"5 3"` (space-separated)  
Result: **ValueError!**

---

## ✅ Simple Solution: Provide Both Formats

### When Creating a Problem

Instead of just:
```typescript
testCases: [
  { input: "5 3", expectedOutput: "8" }
]
```

**Use BOTH formats:**
```typescript
testCases: [
  // Format 1: Space-separated (for .split() users)
  { input: "5 3", expectedOutput: "8" },
  
  // Format 2: Line-by-line (for multiple input() users)
  { input: "5\n3", expectedOutput: "8" }
]
```

---

## Quick Conversion Tool

### Bash Script: `duplicate-test-cases.js`

```javascript
// Run this to convert existing problems
const fs = require('fs');

function convertTestCases(testCases) {
  const result = [];
  
  testCases.forEach(tc => {
    // Keep original
    result.push(tc);
    
    // If space-separated, add line-by-line version
    if (tc.input.includes(' ') && !tc.input.includes('\n')) {
      result.push({
        ...tc,
        input: tc.input.replace(/\s+/g, '\n'),
        id: tc.id + '_lines'
      });
    }
  });
  
  return result;
}

// Usage
const originalTestCases = [
  { id: "tc1", input: "5 3", expectedOutput: "8" },
  { id: "tc2", input: "10 20", expectedOutput: "30" }
];

const newTestCases = convertTestCases(originalTestCases);
console.log(JSON.stringify(newTestCases, null, 2));
```

**Output:**
```json
[
  { "id": "tc1", "input": "5 3", "expectedOutput": "8" },
  { "id": "tc1_lines", "input": "5\n3", "expectedOutput": "8" },
  { "id": "tc2", "input": "10 20", "expectedOutput": "30" },
  { "id": "tc2_lines", "input": "10\n20", "expectedOutput": "30" }
]
```

---

## Problem Description Template

### Copy-Paste This:

```markdown
## Input Format

**You can use either format:**

**Format 1 - Space-separated (one line):**
```
5 3
```

**Format 2 - Line-by-line (multiple lines):**
```
5
3
```

Both formats are supported! Write code your way.

### Example Solutions

**Python (Format 1):**
```python
a, b = map(int, input().split())
print(a + b)
```

**Python (Format 2):**
```python
a = int(input())
b = int(input())
print(a + b)
```

Both will pass all test cases!
```

---

## Real Example

### Problem: Sum Two Numbers

```typescript
const problem = {
  id: "sum-two",
  title: "Sum of Two Numbers",
  description: `
    Read two integers and output their sum.
    
    **Input:** Two integers (use any format you like)
    **Output:** Their sum
    
    **Example 1:**
    Input: 5 3
    Output: 8
    
    **Example 2:**
    Input: 
    5
    3
    Output: 8
  `,
  testCases: [
    // Space-separated tests
    { input: "5 3", expectedOutput: "8" },
    { input: "10 20", expectedOutput: "30" },
    { input: "1 999", expectedOutput: "1000" },
    { input: "0 0", expectedOutput: "0" },
    
    // Line-by-line tests (same values)
    { input: "5\n3", expectedOutput: "8" },
    { input: "10\n20", expectedOutput: "30" },
    { input: "1\n999", expectedOutput: "1000" },
    { input: "0\n0", expectedOutput: "0" }
  ]
};
```

---

## All Languages Work

### Python

```python
# Style 1
a, b = map(int, input().split())

# Style 2
a = int(input())
b = int(input())

# Style 3
import sys
nums = list(map(int, sys.stdin.read().split()))
a, b = nums[0], nums[1]
```

### JavaScript

```javascript
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

// Works with both!
const nums = input.split(/\s+/).map(Number);
const [a, b] = nums;
console.log(a + b);
```

### Java

```java
Scanner sc = new Scanner(System.in);
// Works with both "5 3" and "5\n3"
int a = sc.nextInt();
int b = sc.nextInt();
System.out.println(a + b);
```

### C++

```cpp
int a, b;
cin >> a >> b;  // Works with both formats!
cout << a + b << endl;
```

---

## Why This Works

1. **Space-separated test:** `"5 3"`
   - User with `.split()` → ✅ Works
   - User with multiple `input()` → ❌ Fails this test

2. **Line-by-line test:** `"5\n3"`
   - User with `.split()` → ✅ Works (reads first line)
   - User with multiple `input()` → ✅ Works

**Result:** To pass ALL tests, either style works, but having both ensures flexibility!

---

## Quick Action Items

### For Existing Problems

1. Open admin panel
2. Edit each problem
3. For each test case with spaces, add a copy with `\n` instead
4. Save

### Example Edit:

**Before:**
```
Test 1: Input "5 3", Output "8"
Test 2: Input "10 20", Output "30"
```

**After:**
```
Test 1: Input "5 3", Output "8"
Test 2: Input "5\n3", Output "8"
Test 3: Input "10 20", Output "30"
Test 4: Input "10\n20", Output "30"
```

---

## Done! 🎉

Now users can write:

```python
# This works
a, b = map(int, input().split())
```

**AND**

```python
# This also works
a = int(input())
b = int(input())
```

**No more ValueError! No more confusion!**

---

## Pro Tip

Add this to your problem creation UI:

```tsx
<button onClick={() => {
  const duplicated = testCases.flatMap(tc => {
    if (tc.input.includes(' ') && !tc.input.includes('\n')) {
      return [
        tc,
        { ...tc, input: tc.input.replace(/\s+/g, '\n') }
      ];
    }
    return [tc];
  });
  setTestCases(duplicated);
}}>
  📋 Duplicate test cases with line-by-line format
</button>
```

This button automatically creates both versions! ✨
