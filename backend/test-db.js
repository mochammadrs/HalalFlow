const db = require('./src/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time from DB:', result.rows[0].now);
    
    // Check if tables exist
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in database:');
    if (tables.rows.length === 0) {
      console.log('⚠️  No tables found! You need to run init.sql');
    } else {
      tables.rows.forEach(row => console.log('  -', row.table_name));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
