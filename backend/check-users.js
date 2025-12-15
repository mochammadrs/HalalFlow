const db = require('./src/db');

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');
    
    const result = await db.query('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    
    if (result.rows.length === 0) {
      console.log('⚠️  No users found in database');
    } else {
      console.log(`✅ Found ${result.rows.length} user(s):\n`);
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
