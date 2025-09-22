'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { couponsAPI, Coupon } from '@/lib/api/coupons';

interface CouponValidatorProps {
    onCouponApplied?: (coupon: Coupon, discount: number) => void;
    onCouponRemoved?: () => void;
    appliedCoupon?: Coupon | null;
    className?: string;
}

export default function CouponValidator({
    onCouponApplied,
    onCouponRemoved,
    appliedCoupon,
    className = ''
}: CouponValidatorProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleValidate = async () => {
        if (!code.trim()) {
            setError('Por favor ingresa un código de cupón');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await couponsAPI.validateCoupon(code.toUpperCase());

            if (result.valid && result.coupon) {
                setSuccess(`¡Cupón válido! ${result.coupon.discount}% de descuento`);
                setCode('');
                onCouponApplied?.(result.coupon, result.coupon.discount);
            } else {
                setError(result.message || 'Cupón no válido');
            }
        } catch (err: any) {
            setError(err.message || 'Error al validar el cupón');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Por favor ingresa un código de cupón');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await couponsAPI.applyCoupon(code.toUpperCase());

            if (result.success && result.coupon) {
                setSuccess(`¡Cupón aplicado! ${result.discount}% de descuento`);
                setCode('');
                onCouponApplied?.(result.coupon, result.discount);
            } else {
                setError(result.message || 'No se pudo aplicar el cupón');
            }
        } catch (err: any) {
            setError(err.message || 'Error al aplicar el cupón');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setSuccess('');
        setError('');
        onCouponRemoved?.();
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cupón de Descuento</h3>

            {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                Cupón aplicado: {appliedCoupon.code}
                            </p>
                            <p className="text-sm text-green-600">
                                {appliedCoupon.discount}% de descuento
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemove}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                            Remover
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Ingresa código del cupón"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                        />
                        <Button
                            onClick={handleValidate}
                            disabled={loading || !code.trim()}
                            variant="outline"
                        >
                            {loading ? 'Validando...' : 'Validar'}
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={loading || !code.trim()}
                        >
                            {loading ? 'Aplicando...' : 'Aplicar'}
                        </Button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-sm text-green-600">{success}</p>
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        <p>• Los cupones son sensibles a mayúsculas y minúsculas</p>
                        <p>• Algunos cupones pueden tener restricciones de uso</p>
                    </div>
                </div>
            )}
        </div>
    );
}