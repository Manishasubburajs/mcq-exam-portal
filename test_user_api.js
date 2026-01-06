// Test script to verify User Management API functionality
const fetch = require('node-fetch');

async function testUserAPI() {
    const baseUrl = 'http://localhost:3000/api';
    
    console.log('🧪 Testing User Management API...\n');
    
    try {
        // Test 1: GET all users
        console.log('📝 Test 1: GET /api/users');
        const getResponse = await fetch(`${baseUrl}/users`);
        const getData = await getResponse.json();
        
        if (getData.success) {
            console.log(`✅ Successfully fetched ${getData.data.length} users`);
            if (getData.data.length > 0) {
                const user = getData.data[0];
                console.log(`   Sample user: ${user.first_name} ${user.last_name} (${user.role})`);
                console.log(`   Has student_details: ${user.student_details ? 'Yes' : 'No'}`);
            }
        } else {
            console.log(`❌ Failed to fetch users: ${getData.error}`);
        }
        
        // Test 2: GET single user (if users exist)
        if (getData.data && getData.data.length > 0) {
            console.log('\n📝 Test 2: GET /api/users/:id');
            const userId = getData.data[0].user_id;
            const singleResponse = await fetch(`${baseUrl}/users?id=${userId}`);
            const singleData = await singleResponse.json();
            
            if (singleData.success) {
                console.log(`✅ Successfully fetched user ID: ${userId}`);
                console.log(`   User data includes student_details: ${singleData.data.student_details ? 'Yes' : 'No'}`);
            } else {
                console.log(`❌ Failed to fetch single user: ${singleData.error}`);
            }
        }
        
        console.log('\n✅ All API tests completed');
        
    } catch (error) {
        console.log(`❌ Error testing API: ${error.message}`);
        console.log('\n💡 Make sure the development server is running with "npm run dev"');
    }
}

testUserAPI();