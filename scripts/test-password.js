const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2b$10$JuP9JI6qlUVCUrJJp/TueegpAtZLMcXAYPadj7LmobffTyusWVrn6';

async function testPassword() {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password match:', isMatch);
    
    // Generate a new hash to be sure
    const newHash = await bcrypt.hash(password, 10);
    console.log('\nNew hash generated:');
    console.log(newHash);
    
    console.log('\nUpdate your user with this SQL:');
    console.log(`
UPDATE users 
SET password_hash = '${newHash}'
WHERE email = 'admin@dijoker.com';
    `);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
