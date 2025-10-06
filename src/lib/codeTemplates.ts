import { TestCase } from '@/types';

interface InputPattern {
  lineCount: number;
  hasSpaceSeparated: boolean;
  maxValuesPerLine: number;
  isMultiLine: boolean;
}

/**
 * Analyzes test cases to understand the input pattern
 */
export function analyzeInputPattern(testCases: TestCase[]): InputPattern {
  if (!testCases || testCases.length === 0) {
    return {
      lineCount: 1,
      hasSpaceSeparated: false,
      maxValuesPerLine: 1,
      isMultiLine: false
    };
  }

  const firstInput = testCases[0].input;
  const lines = firstInput.split('\n').filter(line => line.trim() !== '');
  const lineCount = lines.length;
  const hasSpaceSeparated = lines.some(line => line.includes(' '));
  const maxValuesPerLine = Math.max(...lines.map(line => line.split(/\s+/).length));
  const isMultiLine = lineCount > 1;

  return {
    lineCount,
    hasSpaceSeparated,
    maxValuesPerLine,
    isMultiLine
  };
}

/**
 * Generates a Python code template based on the input pattern
 */
export function generatePythonTemplate(pattern: InputPattern): string {
  const { lineCount, hasSpaceSeparated, maxValuesPerLine, isMultiLine } = pattern;

  let template = '# Auto-generated template based on test case input format\n';
  template += '# You can modify this code as needed\n\n';

  if (!isMultiLine && !hasSpaceSeparated) {
    // Single value input: "5"
    template += '# Read a single integer\n';
    template += 'n = int(input())\n\n';
    template += '# Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine === 2) {
    // Two space-separated values: "5 3"
    template += '# Read two space-separated integers\n';
    template += 'a, b = map(int, input().split())\n\n';
    template += '# Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine > 2) {
    // Multiple space-separated values: "1 2 3 4 5"
    template += '# Read multiple space-separated integers\n';
    template += 'numbers = list(map(int, input().split()))\n\n';
    template += '# Write your solution here\n';
  } else if (isMultiLine && !hasSpaceSeparated) {
    // Multiple lines, single values: "5\n3\n"
    template += '# Read multiple integers from separate lines\n';
    for (let i = 0; i < Math.min(lineCount, 3); i++) {
      const varName = String.fromCharCode(97 + i); // a, b, c, ...
      template += `${varName} = int(input())\n`;
    }
    if (lineCount > 3) {
      template += '# ... add more inputs as needed\n';
    }
    template += '\n# Write your solution here\n';
  } else if (isMultiLine && hasSpaceSeparated) {
    // Complex: array size then array: "3\n5 10 15"
    template += '# Read array size and array elements\n';
    template += 'n = int(input())\n';
    template += 'arr = list(map(int, input().split()))\n\n';
    template += '# Write your solution here\n';
  }

  return template;
}

/**
 * Generates a JavaScript/Node.js code template based on the input pattern
 */
export function generateJavaScriptTemplate(pattern: InputPattern): string {
  const { lineCount, hasSpaceSeparated, maxValuesPerLine, isMultiLine } = pattern;

  let template = '// Auto-generated template based on test case input format\n';
  template += '// You can modify this code as needed\n\n';
  template += 'const readline = require(\'readline\');\n';
  template += 'const rl = readline.createInterface({\n';
  template += '  input: process.stdin,\n';
  template += '  output: process.stdout\n';
  template += '});\n\n';

  if (!isMultiLine) {
    template += 'rl.on(\'line\', (line) => {\n';
    if (!hasSpaceSeparated) {
      // Single value: "5"
      template += '  // Read a single integer\n';
      template += '  const n = parseInt(line);\n\n';
      template += '  // Write your solution here\n';
    } else if (maxValuesPerLine === 2) {
      // Two space-separated values: "5 3"
      template += '  // Read two space-separated integers\n';
      template += '  const [a, b] = line.split(\' \').map(Number);\n\n';
      template += '  // Write your solution here\n';
    } else {
      // Multiple space-separated values: "1 2 3 4 5"
      template += '  // Read multiple space-separated integers\n';
      template += '  const numbers = line.split(\' \').map(Number);\n\n';
      template += '  // Write your solution here\n';
    }
    template += '  rl.close();\n';
    template += '});\n';
  } else {
    // Multi-line input
    template += 'const lines = [];\n';
    template += 'rl.on(\'line\', (line) => {\n';
    template += '  lines.push(line);\n';
    template += '});\n\n';
    template += 'rl.on(\'close\', () => {\n';
    
    if (!hasSpaceSeparated) {
      // Multiple lines, single values: "5\n3\n"
      template += '  // Read multiple integers from separate lines\n';
      for (let i = 0; i < Math.min(lineCount, 3); i++) {
        const varName = String.fromCharCode(97 + i); // a, b, c, ...
        template += `  const ${varName} = parseInt(lines[${i}]);\n`;
      }
      if (lineCount > 3) {
        template += '  // ... add more inputs as needed\n';
      }
      template += '\n  // Write your solution here\n';
    } else {
      // Complex: array size then array: "3\n5 10 15"
      template += '  // Read array size and array elements\n';
      template += '  const n = parseInt(lines[0]);\n';
      template += '  const arr = lines[1].split(\' \').map(Number);\n\n';
      template += '  // Write your solution here\n';
    }
    
    template += '});\n';
  }

  return template;
}

/**
 * Generates a Java code template based on the input pattern
 */
export function generateJavaTemplate(pattern: InputPattern): string {
  const { lineCount, hasSpaceSeparated, maxValuesPerLine, isMultiLine } = pattern;

  let template = '// Auto-generated template based on test case input format\n';
  template += '// You can modify this code as needed\n\n';
  template += 'import java.util.Scanner;\n\n';
  template += 'public class Main {\n';
  template += '  public static void main(String[] args) {\n';
  template += '    Scanner sc = new Scanner(System.in);\n\n';

  if (!isMultiLine && !hasSpaceSeparated) {
    // Single value: "5"
    template += '    // Read a single integer\n';
    template += '    int n = sc.nextInt();\n\n';
    template += '    // Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine === 2) {
    // Two space-separated values: "5 3"
    template += '    // Read two space-separated integers\n';
    template += '    int a = sc.nextInt();\n';
    template += '    int b = sc.nextInt();\n\n';
    template += '    // Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine > 2) {
    // Multiple space-separated values: "1 2 3 4 5"
    template += '    // Read multiple space-separated integers\n';
    template += '    String[] nums = sc.nextLine().split(" ");\n';
    template += '    int[] numbers = new int[nums.length];\n';
    template += '    for (int i = 0; i < nums.length; i++) {\n';
    template += '      numbers[i] = Integer.parseInt(nums[i]);\n';
    template += '    }\n\n';
    template += '    // Write your solution here\n';
  } else if (isMultiLine && !hasSpaceSeparated) {
    // Multiple lines, single values: "5\n3\n"
    template += '    // Read multiple integers from separate lines\n';
    for (let i = 0; i < Math.min(lineCount, 3); i++) {
      const varName = String.fromCharCode(97 + i); // a, b, c, ...
      template += `    int ${varName} = sc.nextInt();\n`;
    }
    if (lineCount > 3) {
      template += '    // ... add more inputs as needed\n';
    }
    template += '\n    // Write your solution here\n';
  } else if (isMultiLine && hasSpaceSeparated) {
    // Complex: array size then array: "3\n5 10 15"
    template += '    // Read array size and array elements\n';
    template += '    int n = sc.nextInt();\n';
    template += '    sc.nextLine(); // Consume newline\n';
    template += '    String[] arrStr = sc.nextLine().split(" ");\n';
    template += '    int[] arr = new int[n];\n';
    template += '    for (int i = 0; i < n; i++) {\n';
    template += '      arr[i] = Integer.parseInt(arrStr[i]);\n';
    template += '    }\n\n';
    template += '    // Write your solution here\n';
  }

  template += '\n    sc.close();\n';
  template += '  }\n';
  template += '}\n';

  return template;
}

/**
 * Generates a C++ code template based on the input pattern
 */
export function generateCppTemplate(pattern: InputPattern): string {
  const { lineCount, hasSpaceSeparated, maxValuesPerLine, isMultiLine } = pattern;

  let template = '// Auto-generated template based on test case input format\n';
  template += '// You can modify this code as needed\n\n';
  template += '#include <iostream>\n';
  template += '#include <vector>\n';
  template += 'using namespace std;\n\n';
  template += 'int main() {\n';

  if (!isMultiLine && !hasSpaceSeparated) {
    // Single value: "5"
    template += '  // Read a single integer\n';
    template += '  int n;\n';
    template += '  cin >> n;\n\n';
    template += '  // Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine === 2) {
    // Two space-separated values: "5 3"
    template += '  // Read two space-separated integers\n';
    template += '  int a, b;\n';
    template += '  cin >> a >> b;\n\n';
    template += '  // Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine > 2) {
    // Multiple space-separated values: "1 2 3 4 5"
    template += '  // Read multiple space-separated integers\n';
    template += '  vector<int> numbers;\n';
    template += '  int num;\n';
    template += '  while (cin >> num) {\n';
    template += '    numbers.push_back(num);\n';
    template += '  }\n\n';
    template += '  // Write your solution here\n';
  } else if (isMultiLine && !hasSpaceSeparated) {
    // Multiple lines, single values: "5\n3\n"
    template += '  // Read multiple integers from separate lines\n';
    for (let i = 0; i < Math.min(lineCount, 3); i++) {
      const varName = String.fromCharCode(97 + i); // a, b, c, ...
      template += `  int ${varName};\n`;
      template += `  cin >> ${varName};\n`;
    }
    if (lineCount > 3) {
      template += '  // ... add more inputs as needed\n';
    }
    template += '\n  // Write your solution here\n';
  } else if (isMultiLine && hasSpaceSeparated) {
    // Complex: array size then array: "3\n5 10 15"
    template += '  // Read array size and array elements\n';
    template += '  int n;\n';
    template += '  cin >> n;\n';
    template += '  vector<int> arr(n);\n';
    template += '  for (int i = 0; i < n; i++) {\n';
    template += '    cin >> arr[i];\n';
    template += '  }\n\n';
    template += '  // Write your solution here\n';
  }

  template += '\n  return 0;\n';
  template += '}\n';

  return template;
}

/**
 * Generates a C code template based on the input pattern
 */
export function generateCTemplate(pattern: InputPattern): string {
  const { lineCount, hasSpaceSeparated, maxValuesPerLine, isMultiLine } = pattern;

  let template = '// Auto-generated template based on test case input format\n';
  template += '// You can modify this code as needed\n\n';
  template += '#include <stdio.h>\n';
  template += '#include <stdlib.h>\n\n';
  template += 'int main() {\n';

  if (!isMultiLine && !hasSpaceSeparated) {
    // Single value: "5"
    template += '  // Read a single integer\n';
    template += '  int n;\n';
    template += '  scanf("%d", &n);\n\n';
    template += '  // Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine === 2) {
    // Two space-separated values: "5 3"
    template += '  // Read two space-separated integers\n';
    template += '  int a, b;\n';
    template += '  scanf("%d %d", &a, &b);\n\n';
    template += '  // Write your solution here\n';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine > 2) {
    // Multiple space-separated values: "1 2 3 4 5"
    template += '  // Read multiple space-separated integers\n';
    template += '  int numbers[100]; // Adjust size as needed\n';
    template += '  int count = 0;\n';
    template += '  int num;\n';
    template += '  while (scanf("%d", &num) == 1) {\n';
    template += '    numbers[count++] = num;\n';
    template += '  }\n\n';
    template += '  // Write your solution here\n';
  } else if (isMultiLine && !hasSpaceSeparated) {
    // Multiple lines, single values: "5\n3\n"
    template += '  // Read multiple integers from separate lines\n';
    for (let i = 0; i < Math.min(lineCount, 3); i++) {
      const varName = String.fromCharCode(97 + i); // a, b, c, ...
      template += `  int ${varName};\n`;
      template += `  scanf("%d", &${varName});\n`;
    }
    if (lineCount > 3) {
      template += '  // ... add more inputs as needed\n';
    }
    template += '\n  // Write your solution here\n';
  } else if (isMultiLine && hasSpaceSeparated) {
    // Complex: array size then array: "3\n5 10 15"
    template += '  // Read array size and array elements\n';
    template += '  int n;\n';
    template += '  scanf("%d", &n);\n';
    template += '  int arr[n];\n';
    template += '  for (int i = 0; i < n; i++) {\n';
    template += '    scanf("%d", &arr[i]);\n';
    template += '  }\n\n';
    template += '  // Write your solution here\n';
  }

  template += '\n  return 0;\n';
  template += '}\n';

  return template;
}

/**
 * Main function to generate a template based on language and test cases
 */
export function generateTemplate(language: string, testCases: TestCase[]): string {
  const pattern = analyzeInputPattern(testCases);

  switch (language.toLowerCase()) {
    case 'python':
      return generatePythonTemplate(pattern);
    case 'javascript':
      return generateJavaScriptTemplate(pattern);
    case 'java':
      return generateJavaTemplate(pattern);
    case 'cpp':
    case 'c++':
      return generateCppTemplate(pattern);
    case 'c':
      return generateCTemplate(pattern);
    default:
      return '// Unsupported language\n';
  }
}

/**
 * Gets a human-readable description of the input format
 */
export function getInputFormatDescription(testCases: TestCase[]): string {
  const pattern = analyzeInputPattern(testCases);
  const { lineCount, hasSpaceSeparated, maxValuesPerLine, isMultiLine } = pattern;

  if (!isMultiLine && !hasSpaceSeparated) {
    return 'Single integer on one line (e.g., "5")';
  } else if (!isMultiLine && hasSpaceSeparated && maxValuesPerLine === 2) {
    return 'Two space-separated integers on one line (e.g., "5 3")';
  } else if (!isMultiLine && hasSpaceSeparated) {
    return `${maxValuesPerLine} space-separated integers on one line (e.g., "1 2 3 4 5")`;
  } else if (isMultiLine && !hasSpaceSeparated) {
    return `${lineCount} integers, each on a separate line`;
  } else if (isMultiLine && hasSpaceSeparated) {
    return 'First line contains array size, second line contains space-separated array elements';
  }
  
  return 'Check the sample test case for the exact input format';
}
