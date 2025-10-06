# Input Format Solution Guide

## The Problem

**User writes:**
```python
n = int(input())
m = int(input())
```

**But test case provides:**
```
Input: "5 3"  # Space-separated on ONE line
```

**Result:** `ValueError: invalid literal for int() with base 10: '5 3'`

---

## Why This Happens

```python
n = int(input())  # Reads ENTIRE first line: "5 3"
                  # Tries: int("5 3") → ❌ ValueError!
m = int(input())  # Never reached
```

The user expects:
```
Input: "5\n3"  # Two separate lines
```

---

## Solution 1: ✅ Provide Multiple Input Formats (RECOMMENDED)

### Create Two Test Cases for Each Problem

**Test Case A: Space-Separated (for split users)**
```typescript
{
  input: "5 3",
  expectedOutput: "8"
}
```

**Test Case B: Line-by-Line (for multiple input users)**
```typescript
{
  input: "5\n3",
  expectedOutput: "8"
}
```

### Implementation in Your Problem Creation

```typescript
// In your problem setup
testCases: [
  // Format 1: Space-separated
  { input: "5 3", expectedOutput: "8" },
  { input: "10 20", expectedOutput: "30" },
  
  // Format 2: Line-by-line (same test, different format)
  { input: "5\n3", expectedOutput: "8" },
  { input: "10\n20", expectedOutput: "30" },
  
  // More edge cases
  { input: "1 999", expectedOutput: "1000" },
  { input: "1\n999", expectedOutput: "1000" }
]
```

**Pros:**
- ✅ Supports all user styles
- ✅ Simple to implement
- ✅ No code changes needed
- ✅ Clear and explicit

**Cons:**
- ⚠️ More test cases (but that's good for testing!)

---

## Solution 2: 📝 Clear Problem Descriptions

### Specify the EXACT input format

```markdown
## Problem: Two Sum

**Input Format:**
First line: Two space-separated integers a and b

OR

First line: Integer a
Second line: Integer b

**Example Input (Format 1):**
```
5 3
```

**Example Input (Format 2):**
```
5
3
```

**Output:**
```
8
```

**Note:** Choose ONE format and be consistent across all test cases!
```

---

## Solution 3: 🔧 Smart Input Preprocessing (Advanced)

### Modify API Route to Handle Both Formats

Update `src/app/api/submissions/route.ts`:

```typescript
function normalizeInput(input: string, code: string): string {
  // Detect if user uses multiple input() calls
  const inputCallCount = (code.match(/input\(\)/g) || []).length;
  
  // If input is space-separated but user expects line-by-line
  if (inputCallCount > 1 && input.includes(' ') && !input.includes('\n')) {
    // Convert "5 3" to "5\n3"
    return input.replace(/\s+/g, '\n');
  }
  
  // If input is line-by-line but user expects space-separated
  if (input.includes('\n') && code.includes('.split()')) {
    // Keep as is or convert based on logic
    return input;
  }
  
  return input;
}

// In execution
const normalizedInput = normalizeInput(testCase.input, code);
```

**Pros:**
- ✅ Automatic handling
- ✅ Users don't need to worry

**Cons:**
- ⚠️ Complex logic
- ⚠️ May not work for all languages
- ⚠️ Can mask real bugs

---

## Solution 4: 🎯 Input Format Validator

### Add Format Selection When Creating Problems

```typescript
interface Problem {
  // ... existing fields
  inputFormat: 'space-separated' | 'line-by-line' | 'both';
  inputFormatDescription: string;
}
```

### In Admin Panel

```tsx
<select name="inputFormat">
  <option value="space-separated">
    Space-separated on one line (e.g., "5 3")
  </option>
  <option value="line-by-line">
    Multiple lines (e.g., "5\n3")
  </option>
  <option value="both">
    Support both formats
  </option>
</select>
```

### Auto-generate test cases

```typescript
function generateTestCase(values: number[], format: string) {
  if (format === 'space-separated') {
    return values.join(' ');
  } else if (format === 'line-by-line') {
    return values.join('\n');
  } else if (format === 'both') {
    // Generate both versions
    return [
      values.join(' '),
      values.join('\n')
    ];
  }
}
```

---

## Best Practice: My Recommendation

### Use **Solution 1** with clear descriptions:

1. **Create problems with BOTH input formats in test cases**
2. **Clearly state in problem description which formats are accepted**
3. **Provide examples for both formats**

### Example Problem Setup

```typescript
{
  id: "sum-two-numbers",
  title: "Sum of Two Numbers",
  description: `
    Given two integers, output their sum.
    
    **Input Format (You can use either):**
    
    Format 1 - Space-separated:
    \`\`\`
    5 3
    \`\`\`
    
    Format 2 - Line-by-line:
    \`\`\`
    5
    3
    \`\`\`
    
    **Output:**
    \`\`\`
    8
    \`\`\`
    
    **Your code should handle the format you prefer!**
  `,
  testCases: [
    // Format 1 tests
    { input: "5 3", expectedOutput: "8" },
    { input: "10 20", expectedOutput: "30" },
    { input: "1 999", expectedOutput: "1000" },
    
    // Format 2 tests (same values, different format)
    { input: "5\n3", expectedOutput: "8" },
    { input: "10\n20", expectedOutput: "30" },
    { input: "1\n999", expectedOutput: "1000" },
    
    // Edge cases
    { input: "0 0", expectedOutput: "0" },
    { input: "0\n0", expectedOutput: "0" },
  ]
}
```

---

## Language-Specific Examples

### Python - Both Formats

```python
# Works with "5 3" (space-separated)
a, b = map(int, input().split())
print(a + b)

# Works with "5\n3" (line-by-line)
a = int(input())
b = int(input())
print(a + b)

# Works with BOTH! (smart version)
import sys
lines = sys.stdin.read().strip().split()
a, b = int(lines[0]), int(lines[1])
print(a + b)
```

### JavaScript - Both Formats

```javascript
const input = require('fs').readFileSync(0, 'utf-8').trim();

// Works with "5 3" (space-separated)
const [a, b] = input.split(' ').map(Number);

// Works with "5\n3" (line-by-line)
const [a, b] = input.split('\n').map(Number);

// Works with BOTH!
const [a, b] = input.split(/\s+/).map(Number);

console.log(a + b);
```

### Java - Both Formats

```java
Scanner sc = new Scanner(System.in);

// Works with both "5 3" and "5\n3"
int a = sc.nextInt();
int b = sc.nextInt();
System.out.println(a + b);
```

---

## Quick Fix for Existing Problems

### Update Test Cases Script

```typescript
// Convert existing space-separated to both formats
function duplicateTestCasesWithLineBreaks(problem: Problem) {
  const newTestCases = [];
  
  for (const testCase of problem.testCases) {
    // Keep original
    newTestCases.push(testCase);
    
    // Add line-by-line version if space-separated
    if (testCase.input.includes(' ') && !testCase.input.includes('\n')) {
      newTestCases.push({
        ...testCase,
        input: testCase.input.replace(/\s+/g, '\n')
      });
    }
  }
  
  return newTestCases;
}
```

---

## Testing Your Solution

### Test Case Generator

```python
# test_both_formats.py
def test_solution():
    # Test space-separated
    solution_space = """
a, b = map(int, input().split())
print(a + b)
"""
    
    # Test line-by-line
    solution_lines = """
a = int(input())
b = int(input())
print(a + b)
"""
    
    test_cases = [
        ("5 3", "8"),
        ("5\n3", "8")
    ]
    
    # Both should pass both formats!
```

---

## Summary

**Recommended Approach:**

1. ✅ **Provide both input formats in test cases**
   - Space-separated: `"5 3"`
   - Line-by-line: `"5\n3"`

2. ✅ **Clear problem descriptions**
   - Show both format examples
   - Tell users "use whichever style you prefer"

3. ✅ **Language-agnostic**
   - Works for Python, JavaScript, Java, C++, C
   - No special preprocessing needed

4. ✅ **Easy to implement**
   - Just add more test cases
   - No code changes to execution engine

**Result:** Users can write code in ANY style and it will work! 🎉

---

## Implementation Checklist

- [ ] Update problem descriptions to show both formats
- [ ] Add line-by-line test cases for existing problems
- [ ] Test with both Python styles
- [ ] Verify with other languages
- [ ] Add format examples to problem template
- [ ] Document in admin guide

---

**With this approach, both styles work perfectly:**

```python
# Style 1 - Works with "5 3"
a, b = map(int, input().split())

# Style 2 - Works with "5\n3"
a = int(input())
b = int(input())
```

**No ValueError, no confusion, happy users!** ✨
