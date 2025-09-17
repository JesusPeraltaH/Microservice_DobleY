// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Intentando conectar a MongoDB...');
    const client = await clientPromise;
    console.log('✅ Conexión a MongoDB exitosa');
    
    const db = client.db('microstore');
    console.log('📦 Usando base de datos: microstore');
    
    const products = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Productos encontrados: ${products.length}`);
    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 Datos recibidos para nuevo producto:', body);
    
    const { name, price, stock, description } = body;
    
    // Validaciones básicas
    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { error: 'Name, price and stock are required' },
        { status: 400 }
      );
    }
    
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
    
    console.log('💾 Guardando producto:', product);
    const result = await db.collection('products').insertOne(product);
    
    console.log('✅ Producto creado con ID:', result.insertedId);
    return NextResponse.json(
      { 
        _id: result.insertedId, 
        ...product,
        message: 'Product created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    );
  }
}