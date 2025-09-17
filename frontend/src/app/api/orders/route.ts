// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const orders = await db
      .collection('orders')
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, items, total, status, paymentMethod } = body;
    
    // Validaciones
    if (!customerName || !items || !total) {
      return NextResponse.json(
        { error: 'Customer name, items and total are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('microstore');
    
    const order = {
      customerName,
      customerEmail: customerEmail || '',
      items: Array.isArray(items) ? items : [],
      total: parseFloat(total),
      status: status || 'Completado',
      paymentMethod: paymentMethod || 'Efectivo',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('orders').insertOne(order);
    
    return NextResponse.json(
      { 
        _id: result.insertedId, 
        ...order,
        message: 'Order created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    );
  }
}

// Nuevo endpoint PATCH para actualizar órdenes
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;
    
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('microstore');
    
    const result = await db
      .collection('orders')
      .updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            status,
            updatedAt: new Date()
          } 
        }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Error updating order' },
      { status: 500 }
    );
  }
}