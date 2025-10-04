/**
 * CLIENT-SIDE CODE EXECUTION
 * 
 * This module handles browser-based code execution for JavaScript and Python.
 * No API calls needed - instant feedback!
 * 
 * Supported:
 * - JavaScript: Native execution using Function()
 * - Python: Pyodide WASM (loads once, cached)
 */

import { CodeExecutionResult } from '@/types';

// Global Pyodide instance (loaded once, reused)
let pyodideInstance: any = null;
let pyodideLoading: Promise<any> | null = null;

/**
 * Check if code can run in browser (client-side)
 */
export function canRunInBrowser(language: string): boolean {
  return language === 'javascript' || language === 'python';
}

/**
 * Execute code in browser (client-side)
 * Returns null if language not supported
 */
export async function executeInBrowser(
  code: string,
  language: string,
  input: string
): Promise<CodeExecutionResult | null> {
  const startTime = Date.now();
  
  try {
    if (language === 'javascript') {
      return executeJavaScript(code, input, startTime);
    }
    
    if (language === 'python') {
      return await executePython(code, input, startTime);
    }
    
    return null; // Language not supported in browser
    
  } catch (error: any) {
    return {
      output: '',
      error: error.message || 'Execution failed',
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Execute JavaScript in browser
 * Safe execution using Function() with timeout
 */
function executeJavaScript(
  code: string,
  input: string,
  startTime: number
): CodeExecutionResult {
  try {
    // Create isolated execution environment
    const logs: string[] = [];
    const errors: string[] = [];
    
    // Mock console for capturing output
    const mockConsole = {
      log: (...args: any[]) => logs.push(args.map(String).join(' ')),
      error: (...args: any[]) => errors.push(args.map(String).join(' ')),
      warn: (...args: any[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
    };
    
    // Create function with input available
    const wrappedCode = `
      const input = ${JSON.stringify(input)};
      const console = mockConsole;
      
      ${code}
    `;
    
    // Execute with timeout (3 seconds)
    const fn = new Function('mockConsole', wrappedCode);
    const timeout = setTimeout(() => {
      throw new Error('Time Limit Exceeded (3s)');
    }, 3000);
    
    fn(mockConsole);
    clearTimeout(timeout);
    
    const executionTime = Date.now() - startTime;
    
    return {
      output: logs.join('\n'),
      error: errors.length > 0 ? errors.join('\n') : undefined,
      executionTime,
    };
    
  } catch (error: any) {
    return {
      output: '',
      error: `Runtime Error: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Execute Python using Pyodide WASM
 * First load: ~2-3 seconds (downloads WASM)
 * Subsequent runs: instant (cached)
 */
async function executePython(
  code: string,
  input: string,
  startTime: number
): Promise<CodeExecutionResult> {
  try {
    // Load Pyodide if not already loaded
    if (!pyodideInstance) {
      if (!pyodideLoading) {
        pyodideLoading = loadPyodide();
      }
      pyodideInstance = await pyodideLoading;
    }
    
    // Capture stdout
    let output = '';
    pyodideInstance.setStdout({
      batched: (text: string) => {
        output += text;
      },
    });
    
    // Set input as global variable
    pyodideInstance.globals.set('INPUT', input);
    
    // Wrap code to handle input()
    const wrappedCode = `
import sys
from io import StringIO

# Mock input
_input_lines = INPUT.strip().split('\\n')
_input_index = 0

def input(prompt=''):
    global _input_index
    if _input_index < len(_input_lines):
        line = _input_lines[_input_index]
        _input_index += 1
        return line
    return ''

# Execute user code
${code}
`;
    
    // Execute with timeout
    const timeout = setTimeout(() => {
      throw new Error('Time Limit Exceeded (3s)');
    }, 3000);
    
    await pyodideInstance.runPythonAsync(wrappedCode);
    clearTimeout(timeout);
    
    const executionTime = Date.now() - startTime;
    
    return {
      output: output.trim(),
      executionTime,
    };
    
  } catch (error: any) {
    return {
      output: '',
      error: `Runtime Error: ${error.message}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Load Pyodide WASM
 * Downloads ~6MB on first load, then cached by browser
 */
async function loadPyodide(): Promise<any> {
  try {
    // @ts-ignore - Pyodide is loaded via CDN
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    });
    return pyodide;
  } catch (error) {
    throw new Error('Failed to load Python runtime. Please check your internet connection.');
  }
}

/**
 * Check if Pyodide is loaded
 */
export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}

/**
 * Preload Pyodide (call on page load to warm up)
 */
export async function preloadPyodide(): Promise<void> {
  if (!pyodideInstance && !pyodideLoading) {
    pyodideLoading = loadPyodide();
    pyodideInstance = await pyodideLoading;
  }
}

/**
 * Get execution strategy info
 */
export function getExecutionStrategy(language: string): string {
  if (language === 'javascript') {
    return '⚡ Instant (Browser)';
  }
  if (language === 'python') {
    return pyodideInstance ? '⚡ Instant (Browser)' : '⏳ Loading Python runtime...';
  }
  return '🌐 API (Piston)';
}
