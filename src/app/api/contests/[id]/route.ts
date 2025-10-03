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
    const updated = await contestStorage.update(id, body);
    
    if (!updated) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
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
