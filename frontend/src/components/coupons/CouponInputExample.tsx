'use client';

import { useState } from 'react';
import CouponInput from './CouponInput';
import CouponInputEnhanced from './CouponInputEnhanced';

interface CouponInputExampleProps {
  className?: string;
}

export default function CouponInputExample({ className = '' }: CouponInputExampleProps) {
  // Example order data
  const [orderId] = useState('68cb430a73bf483fae281c40');
  const [currentTotal] = useState(6020);
  const [couponResult, setCouponResult] = useState<any>(null);

  const handleCouponApplied = (result: any) => {
    setCouponResult(result);
    console.log('Coupon applied:', result);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon Input Examples</h2>
        
        {/* Example order info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Example Order</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Current Total:</strong> ${currentTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Basic CouponInput */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Basic CouponInput Component</h3>
          <CouponInput
            orderId={orderId}
            currentTotal={currentTotal}
            onCouponApplied={handleCouponApplied}
          />
        </div>

        {/* Enhanced CouponInput with hook */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Enhanced CouponInput with Hook</h3>
          <CouponInputEnhanced
            orderId={orderId}
            currentTotal={currentTotal}
            onCouponApplied={handleCouponApplied}
          />
        </div>

        {/* Result display */}
        {couponResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Last Applied Coupon Result</h3>
            <pre className="text-xs text-blue-700 overflow-auto">
              {JSON.stringify(couponResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
