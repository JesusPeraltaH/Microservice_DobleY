const supabase = require('./src/config/supabase');

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');

        // Test basic connection by querying the coupons table
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Connection failed:', error.message);
            return;
        }

        console.log('✅ Connection successful!');
        console.log('📊 Sample data:', data);

        // Test table structure
        console.log('\n🔍 Testing table structure...');
        const { data: tableData, error: tableError } = await supabase
            .from('coupons')
            .select('id, code, discount, valid_from, valid_until, usage_limit, used_count')
            .limit(1);

        if (tableError) {
            console.error('❌ Table structure error:', tableError.message);
            return;
        }

        console.log('✅ Table structure matches expected schema');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

testConnection();