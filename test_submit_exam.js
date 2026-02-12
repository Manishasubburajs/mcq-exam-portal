const axios = require('axios');

// Test data
const testPayload = {
  examId: "30001",
  attemptId: "1",
  answers: {
    "1": "A",
    "2": "B",
    "3": "C",
    "4": "D",
    "5": "C",
    "6": "B",
    "7": "A",
    "8": "D",
    "10": "D",
    "11": "B",
    "12": "C"
  },
  questionTimes: {
    "1": 12,
    "2": 2,
    "3": 2,
    "4": 2,
    "5": 2,
    "6": 2,
    "7": 2,
    "8": 3,
    "9": 1,
    "10": 2,
    "11": 2,
    "12": 2,
    "13": 11
  },
  totalTimeTaken: 45,
  autoSubmitted: false
};

// Note: You'll need to replace this with a valid token from your application
const testToken = "your_valid_token_here";

const testSubmitExam = async () => {
  try {
    console.log("Testing exam submission...");
    console.log("Payload:", JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/students/exams/submit', testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log("\n✅ Exam submission successful!");
    } else {
      console.log("\n❌ Exam submission failed!");
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
testSubmitExam();
