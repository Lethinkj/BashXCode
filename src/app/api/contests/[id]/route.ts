import { NextRequest, NextResponse } from 'next/server';
import { contestStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const contest = await contestStorage.getById(id);
    
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    
    return NextResponse.json(contest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contest' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate required fields if provided
    if (body.problems !== undefined) {
      if (!Array.isArray(body.problems) || body.problems.length === 0) {
        return NextResponse.json(
          { error: 'Contest must have at least one problem' },
          { status: 400 }
        );
      }
      
      // Validate each problem has required fields
      for (const problem of body.problems) {
        if (!problem.title || !problem.description || !problem.points || !problem.testCases || problem.testCases.length === 0) {
          return NextResponse.json(
            { error: 'Each problem must have title, description, points, and at least one test case' },
            { status: 400 }
          );
        }
      }
    }
    
    // Validate time fields
    if (body.startTime && body.endTime) {
      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);
      
      if (endTime <= startTime) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }
    
    const updated = await contestStorage.update(id, body);
    
    if (!updated) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update contest:', error);
    return NextResponse.json({ error: 'Failed to update contest' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deleted = await contestStorage.delete(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete contest' }, { status: 500 });
  }
}
