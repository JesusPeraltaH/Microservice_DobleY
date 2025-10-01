/**
 * Example of how to test the /api/orders/apply-coupon endpoint
 * This is a test file that demonstrates the API usage
 */

// Example test data
const testData = {
  orderId: "68cb430a73bf483fae281c40", // Example MongoDB ObjectId
  couponCode: "SAVE10" // Example coupon code
};

// Example function to test the endpoint
async function testApplyCoupon() {
  try {
    const response = await fetch('/api/orders/apply-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
    if (result.success) {
      console.log(`✅ Coupon applied successfully!`);
      console.log(`Total before discount: $${result.totalBeforeDiscount}`);
      console.log(`Total after discount: $${result.totalAfterDiscount}`);
      console.log(`Savings: $${result.totalBeforeDiscount - result.totalAfterDiscount}`);
    } else {
      console.log(`❌ Failed to apply coupon: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error testing apply coupon:', error);
  }
}

// Example cURL command for testing
const curlCommand = `
curl -X POST http://localhost:3000/api/orders/apply-coupon \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "68cb430a73bf483fae281c40",
    "couponCode": "SAVE10"
  }'
`;

console.log('cURL command for testing:');
console.log(curlCommand);

// Uncomment the line below to run the test
// testApplyCoupon();
