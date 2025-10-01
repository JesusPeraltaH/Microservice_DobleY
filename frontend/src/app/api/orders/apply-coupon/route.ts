import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import clientPromise from '@/lib/mongodb';

// Type definitions
interface Coupon {
  id: string;
  code: string;
  discount: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  used_count: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  totalAfterDiscount?: number;
  discountApplied?: number;
  couponCode?: string;
  couponId?: string;
  couponDiscount?: number;
  appliedAt?: Date;
}

interface ApplyCouponRequest {
  orderId: string;
  couponCode: string;
}

interface ApplyCouponResponse {
  success: boolean;
  message: string;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  couponCode: string;
  couponApplied: boolean;
}

/**
 * POST /api/orders/apply-coupon
 * Applies a coupon to an order by validating the coupon and updating the order total
 * 
 * Request body:
 * - orderId: string (MongoDB ObjectId)
 * - couponCode: string
 * 
 * Response:
 * - success: boolean
 * - message: string
 * - totalBeforeDiscount: number
 * - totalAfterDiscount: number
 * - couponCode: string
 * - couponApplied: boolean
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApplyCouponResponse>> {
  try {
    // Parse request body
    const body: ApplyCouponRequest = await request.json();
    const { orderId, couponCode } = body;

    // Validate required fields
    if (!orderId || !couponCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'orderId and couponCode are required',
          totalBeforeDiscount: 0,
          totalAfterDiscount: 0,
          couponCode: couponCode || '',
          couponApplied: false
        },
        { status: 400 }
      );
    }

    // Step 1: Validate coupon in Supabase
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coupon not found',
          totalBeforeDiscount: 0,
          totalAfterDiscount: 0,
          couponCode,
          couponApplied: false
        },
        { status: 404 }
      );
    }

    // Step 2: Validate coupon conditions
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    // Check if coupon is within validity period
    if (now < validFrom || now > validUntil) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coupon is not valid at this time',
          totalBeforeDiscount: 0,
          totalAfterDiscount: 0,
          couponCode,
          couponApplied: false
        },
        { status: 400 }
      );
    }

    // Check if coupon usage limit has been reached
    if (coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coupon usage limit has been reached',
          totalBeforeDiscount: 0,
          totalAfterDiscount: 0,
          couponCode,
          couponApplied: false
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch order from MongoDB
    const client = await clientPromise;
    const db = client.db('microservice_dobley'); // Adjust database name as needed
    const ordersCollection = db.collection<Order>('orders');

    const order = await ordersCollection.findOne({ _id: orderId });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
          totalBeforeDiscount: 0,
          totalAfterDiscount: 0,
          couponCode,
          couponApplied: false
        },
        { status: 404 }
      );
    }

    // Step 4: Calculate discount
    const totalBeforeDiscount = order.total;
    const discountAmount = (totalBeforeDiscount * coupon.discount) / 100;
    const totalAfterDiscount = Math.max(0, totalBeforeDiscount - discountAmount);

    // Step 5: Update order in MongoDB with coupon information
    const updateData = {
      $set: {
        totalAfterDiscount,
        discountApplied: discountAmount,
        couponCode: coupon.code,
        couponId: coupon.id,
        couponDiscount: coupon.discount,
        appliedAt: new Date(),
        updatedAt: new Date()
      }
    };

    const updateResult = await ordersCollection.updateOne(
      { _id: orderId },
      updateData
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update order',
          totalBeforeDiscount,
          totalAfterDiscount,
          couponCode,
          couponApplied: false
        },
        { status: 500 }
      );
    }

    // Step 6: Increment used_count in Supabase
    const { error: updateCouponError } = await supabase
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id);

    if (updateCouponError) {
      console.error('Failed to update coupon usage count:', updateCouponError);
      // Note: We don't fail the request here as the order was already updated
      // In a production environment, you might want to implement a rollback mechanism
    }

    // Step 7: Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Coupon "${couponCode}" applied successfully. Discount: ${coupon.discount}%`,
        totalBeforeDiscount,
        totalAfterDiscount,
        couponCode,
        couponApplied: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error applying coupon:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while applying coupon',
        totalBeforeDiscount: 0,
        totalAfterDiscount: 0,
        couponCode: '',
        couponApplied: false
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse<{ message: string }>> {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to apply a coupon.' },
    { status: 405 }
  );
}
