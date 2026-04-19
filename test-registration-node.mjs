import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const testRegistration = async () => {
  try {
    const form = new FormData();
    
    // Add text fields
    form.append('name', 'Node Test User');
    form.append('username', 'nodetest999');
    form.append('email', 'nodetest999@example.com');
    form.append('password', 'password123');
    form.append('bio', 'Test from Node.js');
    form.append('currentPost', 'Software Engineer');
    form.append('education', JSON.stringify([
      { school: 'MIT', degree: 'BS', fieldOfStudy: 'CS', years: '2020' }
    ]));
    form.append('pastWork', JSON.stringify([
      { company: 'Google', position: 'SDE', years: '3', description: 'Backend development' }
    ]));
    
    console.log('📤 Sending FormData to http://localhost:5000/api/users/register');
    console.log('Form fields:', {
      name: 'Node Test User',
      username: 'nodetest999',
      email: 'nodetest999@example.com',
      bio: 'Test from Node.js',
      education: '[...]',
      pastWork: '[...]'
    });
    
    const response = await axios.post('http://localhost:5000/api/users/register', form, {
      headers: form.getHeaders(),
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', error.response?.data || error.message);
  }
};

testRegistration();
