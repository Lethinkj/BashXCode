import { NextRequest, NextResponse } from 'next/server';
import { executeCode } from '@/lib/codeExecution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, input } = body;
    
    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }
    
    const result = await executeCode({ code, language, input: input || '' });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute code' },
      { status: 500 }
    );
  }
}
