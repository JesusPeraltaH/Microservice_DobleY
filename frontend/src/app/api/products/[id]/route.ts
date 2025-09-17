// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Buscando producto con ID:', id);
    
    // Validar ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('microstore');
    const product = await db
      .collection('products')
      .findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Producto encontrado:', product.name);
    return NextResponse.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('✏️ Actualizando producto ID:', id, 'con datos:', body);
    
    // Validar ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // Validaciones
    if (!body.name || !body.price || body.stock === undefined) {
      return NextResponse.json(
        { error: 'Name, price and stock are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const updateData = {
      name: body.name,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
      description: body.description || '',
      category: body.category || '',
      updatedAt: new Date()
    };
    
    const result = await db
      .collection('products')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Producto actualizado correctamente');
    return NextResponse.json({
      message: 'Product updated successfully',
      _id: id,
      ...updateData
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('✏️ Actualizando parcialmente producto ID:', id, 'con datos:', body);
    
    // Validar ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    
    updateData.updatedAt = new Date();
    
    const result = await db
      .collection('products')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Producto actualizado correctamente');
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Eliminando producto ID:', id);
    
    // Validar ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('microstore');
    const result = await db
      .collection('products')
      .deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Producto eliminado correctamente');
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
}