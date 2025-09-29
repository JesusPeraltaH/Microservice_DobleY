// Test script to verify support service integration
const API_BASE_URL = 'http://localhost:3005';

async function testSupportService() {
    console.log('🧪 Testing Support Service Integration...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);

        // Test 2: Create a test ticket
        console.log('\n2. Testing ticket creation...');
        const ticketData = {
            idUsuario: 'test-user-123',
            tipo_ticket: 'problema',
            descripcion: 'Test ticket created from frontend integration test',
            customerName: 'Test User',
            total: 99.99
        };

        const createResponse = await fetch(`${API_BASE_URL}/api/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });

        if (createResponse.ok) {
            const createdTicket = await createResponse.json();
            console.log('✅ Ticket created:', createdTicket);

            // Test 3: Get tickets
            console.log('\n3. Testing get tickets...');
            const getResponse = await fetch(`${API_BASE_URL}/api/tickets`);
            const tickets = await getResponse.json();
            console.log('✅ Retrieved tickets:', tickets);

            // Test 4: Get ticket stats
            console.log('\n4. Testing ticket stats...');
            const statsResponse = await fetch(`${API_BASE_URL}/api/tickets/stats`);
            const stats = await statsResponse.json();
            console.log('✅ Ticket stats:', stats);

        } else {
            const error = await createResponse.json();
            console.log('❌ Failed to create ticket:', error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the soporte-service is running on port 3005');
        console.log('   Run: cd soporte-service && npm run dev');
    }
}

// Run the test
testSupportService();