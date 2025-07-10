const axios = require('axios');

// Test functions
const runTests = async () => {
    const port = process.env.PORT || 8000;
    const BASE_URL = `http://localhost:${port}/api`;
    let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZmNzVhMDA4ZGQwMzcxNDRlYjgyZWYiLCJ1c2VybmFtZSI6IktlaSBOaXNoaWtvcmkiLCJyb2xlIjoidXNlciIsImVtYWlsIjoiNDQ3NDI5OTE0MjkxIiwiaWF0IjoxNzUyMTM1MDczLCJleHAiOjE3NTIyMjE0NzN9.k7Q8mjvpr1ahmMHaAfYL0kSJysuqi9IoYmLYdi8VEY0";
    let educationId = '686fb4ee58754e216c2b96fe';
    let moduleId = '';
    let quizId = '';
    console.log('🚀 Starting Education API Tests...\n');

    const testEducation = {
        name: 'Test Education Category 1',
        description: 'This is a test education category for testing purposes'
    };

    const testModule = {
        title: 'Test Module',
        description: 'This is a test module',
        type: 'video',
        url: 'https://example.com/video.mp4',
        content: 'Test video content'
    };

    const testQuiz = {
        question: 'What is the capital of France?',
        answer: 'Paris',
        options: ['London', 'Paris', 'Berlin', 'Madrid']
    };

    const updatedEducation = {
        name: 'Updated Education Category',
        description: 'This is an updated education category'
    };

    const updatedModule = {
        title: 'Updated Module',
        description: 'This is an updated module',
        type: 'text',
        content: 'Updated text content'
    };

    const updatedQuiz = {
        question: 'What is 2 + 2?',
        answer: '4',
        options: ['3', '4', '5', '6']
    };

    const makeAuthRequest = async (method, url, data = null) => {
        let config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        return axios(config);
    };

    // Helper function to make requests without auth
    const makeRequest = async (method, url, data = null) => {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        return axios(config);
    };

    
    try {
        // Test 1: Login to get auth token
        console.log('1. Testing Authentication...');
        try {
            const loginResponse = await axios.post('http://localhost:8000/api/auth/login', {
                email: 'superdevp@gmail.com',
                password: 'Uch0618!!'
            });
            console.log(loginResponse.data.success);
            if (loginResponse.data.success) {
                authToken = loginResponse.data.accessToken;
                console.log('✅ Authentication successful');
            } else {
                console.log('⚠️  Authentication failed, using empty token for testing');
            }
        } catch (error) {
            console.log('⚠️ !!!  Authentication failed, using empty token for testing');
        }
        
        // Test 2: Create Education Category
        console.log('\n2. Testing Create Education Category...');
        try {
            const response = await makeAuthRequest('POST', '/education', testEducation);
            if (response.data.success) {
                // educationId = response.data.data._id;
                console.log('✅ Education category created successfully');
                console.log(`   ID: ${educationId}`);
            } else {
                console.log('❌ Failed to create education category');
            }
        } catch (error) {
            console.log('❌ Error creating education category:', error.response?.data?.message || error.message);
        }
        
        // Test 3: Get All Education Categories
        console.log('\n3. Testing Get All Education Categories...');
        try {
            const response = await makeAuthRequest('GET', '/education');
            if (response.data.success) {
                console.log('✅ Retrieved all education categories');
                console.log(`   Count: ${response.data.data.length}`);
            } else {
                console.log('❌ Failed to get education categories');
            }
        } catch (error) {
            console.log('❌ Error getting education categories:', error.response?.data?.message || error.message);
        }
        
        // Test 4: Get Education Category by ID
        console.log('\n4. Testing Get Education Category by ID...');
        if (educationId) {
            try {
                const response = await makeAuthRequest('GET', `/education/${educationId}`);
                if (response.data.success) {
                    console.log('✅ Retrieved education category by ID');
                    console.log(`   Name: ${response.data.data.name}`);
                } else {
                    console.log('❌ Failed to get education category by ID');
                }
            } catch (error) {
                console.log('❌ Error getting education category by ID:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        // Test 5: Add Module to Education
        console.log('\n5. Testing Add Module to Education...');
        if (educationId) {
            try {
                const response = await makeAuthRequest('POST', `/education/${educationId}/modules`, testModule);
                if (response.data.success) {
                    // moduleId = response.data.data._id;
                    console.log('✅ Module added successfully');
                    console.log(`   Module ID: ${moduleId}`);
                } else {
                    console.log('❌ Failed to add module');
                }
            } catch (error) {
                console.log('❌ Error adding module:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        // Test 6: Add Quiz to Education
        console.log('\n6. Testing Add Quiz to Education...');
        if (educationId) {
            try {
                const response = await makeAuthRequest('POST', `/education/${educationId}/quizzes`, testQuiz);
                if (response.data.success) {
                    quizId = response.data.data._id;
                    console.log('✅ Quiz added successfully');
                    console.log(`   Quiz ID: ${quizId}`);
                } else {
                    console.log('❌ Failed to add quiz');
                }
            } catch (error) {
                console.log('❌ Error adding quiz:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        // Test 7: Update Education Category
        console.log('\n7. Testing Update Education Category...');
        if (educationId) {
            try {
                const response = await makeAuthRequest('PUT', `/education/${educationId}`, updatedEducation);
                if (response.data.success) {
                    console.log('✅ Education category updated successfully');
                    console.log(`   New name: ${response.data.data.name}`);
                } else {
                    console.log('❌ Failed to update education category');
                }
            } catch (error) {
                console.log('❌ Error updating education category:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        // Test 8: Update Module
        console.log('\n8. Testing Update Module...');
        if (educationId && moduleId) {
            try {
                const response = await makeAuthRequest('PUT', `/education/${educationId}/modules/${moduleId}`, updatedModule);
                if (response.data.success) {
                    console.log('✅ Module updated successfully');
                    console.log(`   New title: ${response.data.data.title}`);
                } else {
                    console.log('❌ Failed to update module');
                }
            } catch (error) {
                console.log('❌ Error updating module:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID or module ID available');
        }
        
        // Test 9: Update Quiz
        console.log('\n9. Testing Update Quiz...');
        if (educationId && quizId) {
            try {
                const response = await makeAuthRequest('PUT', `/education/${educationId}/quizzes/${quizId}`, updatedQuiz);
                if (response.data.success) {
                    console.log('✅ Quiz updated successfully');
                    console.log(`   New question: ${response.data.data.question}`);
                } else {
                    console.log('❌ Failed to update quiz');
                }
            } catch (error) {
                console.log('❌ Error updating quiz:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID or quiz ID available');
        }
        
        // Test 10: Test Duplicate Education Category
        console.log('\n10. Testing Duplicate Education Category...');
        try {
            const response = await makeAuthRequest('POST', '/education', testEducation);
            if (response.data.success) {
                console.log('⚠️  Duplicate education category was created (should not happen)');
            } else {
                console.log('✅ Duplicate education category properly rejected');
            }
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Duplicate education category properly rejected');
            } else {
                console.log('❌ Error testing duplicate education:', error.response?.data?.message || error.message);
            }
        }
        
        // Test 11: Test Invalid Module Type
        console.log('\n11. Testing Invalid Module Type...');
        if (educationId) {
            try {
                const invalidModule = { ...testModule, type: 'invalid' };
                const response = await makeAuthRequest('POST', `/education/${educationId}/modules`, invalidModule);
                if (response.data.success) {
                    console.log('⚠️  Invalid module type was accepted (should not happen)');
                } else {
                    console.log('✅ Invalid module type properly rejected');
                }
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log('✅ Invalid module type properly rejected');
                } else {
                    console.log('❌ Error testing invalid module type:', error.response?.data?.message || error.message);
                }
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        // Test 12: Test Invalid Quiz (answer not in options)
        console.log('\n12. Testing Invalid Quiz (answer not in options)...');
        if (educationId) {
            try {
                const invalidQuiz = { ...testQuiz, answer: 'Invalid Answer' };
                const response = await makeAuthRequest('POST', `/education/${educationId}/quizzes`, invalidQuiz);
                if (response.data.success) {
                    console.log('⚠️  Invalid quiz was accepted (should not happen)');
                } else {
                    console.log('✅ Invalid quiz properly rejected');
                }
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log('✅ Invalid quiz properly rejected');
                } else {
                    console.log('❌ Error testing invalid quiz:', error.response?.data?.message || error.message);
                }
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        // Test 13: Delete Quiz
        console.log('\n13. Testing Delete Quiz...');
        if (educationId && quizId) {
            try {
                const response = await makeAuthRequest('DELETE', `/education/${educationId}/quizzes/${quizId}`);
                if (response.data.success) {
                    console.log('✅ Quiz deleted successfully');
                } else {
                    console.log('❌ Failed to delete quiz');
                }
            } catch (error) {
                console.log('❌ Error deleting quiz:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID or quiz ID available');
        }
        
        // Test 14: Delete Module
        console.log('\n14. Testing Delete Module...');
        if (educationId && moduleId) {
            try {
                const response = await makeAuthRequest('DELETE', `/education/${educationId}/modules/${moduleId}`);
                if (response.data.success) {
                    console.log('✅ Module deleted successfully');
                } else {
                    console.log('❌ Failed to delete module');
                }
            } catch (error) {
                console.log('❌ Error deleting module:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID or module ID available');
        }
        
        // Test 15: Delete Education Category
        console.log('\n15. Testing Delete Education Category...');
        if (educationId) {
            try {
                const response = await makeAuthRequest('DELETE', `/education/${educationId}`);
                if (response.data.success) {
                    console.log('✅ Education category deleted successfully');
                } else {
                    console.log('❌ Failed to delete education category');
                }
            } catch (error) {
                console.log('❌ Error deleting education category:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('⚠️  Skipping test - no education ID available');
        }
        
        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
};

// Run the tests
runTests(); 