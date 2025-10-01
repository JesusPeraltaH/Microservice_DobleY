'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CouponInputProps {
  orderId: string;
  currentTotal: number;
  onCouponApplied?: (result: CouponApplyResult) => void;
  className?: string;
}

interface CouponApplyResult {
  success: boolean;
  message: string;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  couponCode: string;
  couponApplied: boolean;
}

export default function CouponInput({
  orderId,
  currentTotal,
  onCouponApplied,
  className = ''
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CouponApplyResult | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    if (!orderId) {
      setError('Order ID is required');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/orders/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          couponCode: couponCode.trim().toUpperCase()
        })
      });

      const data: CouponApplyResult = await response.json();

      if (data.success) {
        setResult(data);
        setCouponCode('');
        onCouponApplied?.(data);
      } else {
        setError(data.message || 'Failed to apply coupon');
      }
    } catch (err: any) {
      setError(err.message || 'Error applying coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCouponCode('');
    setError('');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateDiscount = () => {
    if (!result) return 0;
    return result.totalBeforeDiscount - result.totalAfterDiscount;
  };

  const calculateDiscountPercentage = () => {
    if (!result || result.totalBeforeDiscount === 0) return 0;
    return Math.round((calculateDiscount() / result.totalBeforeDiscount) * 100);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Apply Coupon</h3>

      {result?.success ? (
        // Success state - coupon applied
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✅ Coupon Applied Successfully!
                </p>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Coupon:</strong> {result.couponCode}</p>
                  <p><strong>Discount Applied:</strong> {calculateDiscountPercentage()}%</p>
                  <p><strong>Savings:</strong> {formatCurrency(calculateDiscount())}</p>
                  <p><strong>Original Total:</strong> {formatCurrency(result.totalBeforeDiscount)}</p>
                  <p><strong>New Total:</strong> {formatCurrency(result.totalAfterDiscount)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Apply Another
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Input state - no coupon applied yet
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
              disabled={loading}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
              className="min-w-[100px]"
            >
              {loading ? 'Applying...' : 'Apply'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {result && !result.success && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-600">{result.message}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Coupon codes are case-insensitive</p>
            <p>• Some coupons may have usage restrictions</p>
            <p>• Current order total: {formatCurrency(currentTotal)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
