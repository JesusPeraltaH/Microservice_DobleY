import { useState, useCallback } from 'react';

interface CouponApplyResult {
  success: boolean;
  message: string;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  couponCode: string;
  couponApplied: boolean;
}

interface UseCouponApplicationProps {
  orderId: string;
  onSuccess?: (result: CouponApplyResult) => void;
  onError?: (error: string) => void;
}

export function useCouponApplication({ orderId, onSuccess, onError }: UseCouponApplicationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CouponApplyResult | null>(null);

  const applyCoupon = useCallback(async (couponCode: string) => {
    if (!couponCode.trim()) {
      const errorMsg = 'Please enter a coupon code';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!orderId) {
      const errorMsg = 'Order ID is required';
      setError(errorMsg);
      onError?.(errorMsg);
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
        onSuccess?.(data);
      } else {
        setError(data.message || 'Failed to apply coupon');
        onError?.(data.message || 'Failed to apply coupon');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error applying coupon';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [orderId, onSuccess, onError]);

  const reset = useCallback(() => {
    setError('');
    setResult(null);
  }, []);

  return {
    applyCoupon,
    reset,
    loading,
    error,
    result,
    isApplied: result?.success || false
  };
}
