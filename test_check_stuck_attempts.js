const axios = require('axios');

// Note: You'll need to replace this with a valid token from your application
const testToken = "your_valid_token_here";

const testCheckStuckAttempts = async () => {
  try {
    console.log("Testing check stuck attempts API...");
    
    const response = await axios.get('http://localhost:3000/api/students/exams/check-stuck-attempts', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log("\n✅ Check stuck attempts successful!");
    } else {
      console.log("\n❌ Check stuck attempts failed!");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
  }
};

// Run the test
testCheckStuckAttempts();
