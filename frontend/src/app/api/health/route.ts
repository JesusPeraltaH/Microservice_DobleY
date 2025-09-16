import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db('microstore').command({ ping: 1 });
    
    return NextResponse.json({ 
      status: 'OK', 
      message: 'Successfully connected to MongoDB Atlas' 
    });
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    return NextResponse.json(
      { status: 'Error', message: 'Failed to connect to MongoDB' },
      { status: 500 }
    );
  }
}