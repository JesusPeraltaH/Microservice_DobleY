import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const product = await db.collection('products').findOne({
      _id: new ObjectId(params.id)
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('MongoDB Error:', error);
    return NextResponse.json(
      { error: 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, price, stock, description } = body;
    
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          description,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    const updatedProduct = await db.collection('products').findOne({
      _id: new ObjectId(params.id)
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('MongoDB Error:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(params.id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Producto eliminado' }, { status: 200 });
  } catch (error) {
    console.error('MongoDB Error:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
}