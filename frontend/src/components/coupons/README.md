# Coupon Input Components

This directory contains React components for applying coupons to orders in the microservices system.

## Components

### 1. `CouponInput.tsx`

A basic React component that consumes the `/api/orders/apply-coupon` endpoint.

**Props:**

- `orderId: string` - MongoDB ObjectId of the order
- `currentTotal: number` - Current total amount of the order
- `onCouponApplied?: (result: CouponApplyResult) => void` - Callback when coupon is applied
- `className?: string` - Additional CSS classes

**Features:**

- Input field for coupon code
- Apply button with loading state
- Success/error message display
- Automatic formatting of currency and percentages
- Disabled state when coupon is applied

### 2. `CouponInputEnhanced.tsx`

An enhanced version using the `useCouponApplication` hook for better state management.

**Props:**

- Same as `CouponInput`

**Features:**

- Uses custom hook for cleaner state management
- Better error handling
- Reusable logic

### 3. `CouponInputExample.tsx`

A demo component showing how to use both coupon input components.

## Custom Hook

### `useCouponApplication.ts`

A custom React hook that encapsulates the coupon application logic.

**Parameters:**

- `orderId: string` - Order ID to apply coupon to
- `onSuccess?: (result: CouponApplyResult) => void` - Success callback
- `onError?: (error: string) => void` - Error callback

**Returns:**

- `applyCoupon: (couponCode: string) => Promise<void>` - Function to apply coupon
- `reset: () => void` - Function to reset state
- `loading: boolean` - Loading state
- `error: string` - Error message
- `result: CouponApplyResult | null` - Application result
- `isApplied: boolean` - Whether coupon was successfully applied

## Usage Examples

### Basic Usage

```tsx
import CouponInput from "@/components/coupons/CouponInput";

function OrderPage() {
  const orderId = "68cb430a73bf483fae281c40";
  const currentTotal = 6020;

  const handleCouponApplied = (result) => {
    console.log("Coupon applied:", result);
    // Update order total, show success message, etc.
  };

  return (
    <div>
      <h1>Order Details</h1>
      <CouponInput
        orderId={orderId}
        currentTotal={currentTotal}
        onCouponApplied={handleCouponApplied}
      />
    </div>
  );
}
```

### Using the Hook

```tsx
import { useCouponApplication } from "@/hooks/useCouponApplication";

function CustomCouponComponent() {
  const { applyCoupon, loading, error, result, isApplied } =
    useCouponApplication({
      orderId: "68cb430a73bf483fae281c40",
      onSuccess: (result) => {
        console.log("Success:", result);
      },
      onError: (error) => {
        console.error("Error:", error);
      },
    });

  return (
    <div>
      <input
        placeholder="Enter coupon code"
        onKeyPress={(e) => e.key === "Enter" && applyCoupon(e.target.value)}
      />
      <button onClick={() => applyCoupon("SAVE10")} disabled={loading}>
        {loading ? "Applying..." : "Apply Coupon"}
      </button>
      {error && <p className="error">{error}</p>}
      {isApplied && <p className="success">Coupon applied!</p>}
    </div>
  );
}
```

## API Integration

The components integrate with the `/api/orders/apply-coupon` endpoint:

**Request:**

```json
{
  "orderId": "68cb430a73bf483fae281c40",
  "couponCode": "SAVE10"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Coupon \"SAVE10\" applied successfully. Discount: 10%",
  "totalBeforeDiscount": 6020,
  "totalAfterDiscount": 5418,
  "couponCode": "SAVE10",
  "couponApplied": true
}
```

## Styling

The components use Tailwind CSS classes and follow the existing design system:

- Consistent with other UI components
- Responsive design
- Proper color coding for success/error states
- Loading states with disabled buttons

## Error Handling

The components handle various error scenarios:

- Network errors
- Invalid coupon codes
- Expired coupons
- Usage limit exceeded
- Order not found
- Server errors

## TypeScript Support

All components are fully typed with TypeScript:

- Proper interface definitions
- Type-safe props
- Generic type parameters where applicable

## Dependencies

- React 19.1.0
- Next.js 15.5.3
- Tailwind CSS
- Custom UI components (`Button`, `Input`)

## Testing

To test the components:

1. Start the development server: `npm run dev`
2. Navigate to a page with the component
3. Use the example component: `CouponInputExample`
4. Test with valid/invalid coupon codes

## Example Test Data

- **Valid Order ID**: `68cb430a73bf483fae281c40`
- **Test Coupon Codes**: `SAVE10`, `DISCOUNT20`, `WELCOME5`
- **Current Total**: `6020` (for testing)
