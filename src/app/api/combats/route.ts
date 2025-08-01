import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { combatDB } from '@/lib/combatDB';
import { CreateCombatRequest } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const combats = await combatDB.getUserCombatsServer(user.id);
    return NextResponse.json(combats);
  } catch (error) {
    console.error('Error fetching combats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateCombatRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.combat_data) {
      return NextResponse.json({ error: 'Name and combat data are required' }, { status: 400 });
    }

    const newCombat = await combatDB.createCombatServer(user.id, body);
    return NextResponse.json(newCombat, { status: 201 });
  } catch (error) {
    console.error('Error creating combat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Combat ID is required' }, { status: 400 });
    }

    const updatedCombat = await combatDB.updateCombatServer(body, user.id);
    
    if (!updatedCombat) {
      return NextResponse.json({ error: 'Combat not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCombat);
  } catch (error) {
    console.error('Error updating combat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Combat ID is required' }, { status: 400 });
    }

    const success = await combatDB.deleteCombatServer(id, user.id);
    
    if (!success) {
      return NextResponse.json({ error: 'Combat not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting combat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
