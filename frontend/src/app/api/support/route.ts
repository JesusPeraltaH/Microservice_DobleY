// app/api/support/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const tickets = await db
      .collection('support_tickets')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Error fetching support tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, customer, priority } = body;
    
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const ticket = {
      title,
      description: description || '',
      customer,
      priority: priority || 'Media',
      status: 'Abierto',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('support_tickets').insertOne(ticket);
    
    return NextResponse.json(
      { _id: result.insertedId, ...ticket },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Error creating support ticket' },
      { status: 500 }
    );
  }
}