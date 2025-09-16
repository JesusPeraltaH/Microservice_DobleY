import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const products = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error('MongoDB Error:', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, stock, description } = body;
    
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const product = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(product);
    
    return NextResponse.json(
      { _id: result.insertedId, ...product },
      { status: 201 }
    );
  } catch (error) {
    console.error('MongoDB Error:', error);
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    );
  }
}