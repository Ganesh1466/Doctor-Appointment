
import axios from 'axios';

async function testEndpoint() {
    try {
        const response = await axios.get('http://localhost:5000/api/admin/booking-stats');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
    }
}

testEndpoint();
