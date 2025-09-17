// src/app/api/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('microstore');
    
    const coupons = await db
      .collection('coupons')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Error fetching coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discount, discountType, minPurchase, expiresAt, usageLimit } = body;
    
    const client = await clientPromise;
    const db = client.db('microstore');
    
    // Check if coupon code already exists
    const existingCoupon = await db
      .collection('coupons')
      .findOne({ code });
    
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    const coupon = {
      code,
      discount: Number(discount),
      discountType, // 'percentage' or 'fixed'
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db
      .collection('coupons')
      .insertOne(coupon);
    
    return NextResponse.json({
      success: true,
      coupon: { ...coupon, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Error creating coupon' },
      { status: 500 }
    );
  }
}