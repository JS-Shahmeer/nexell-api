import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required database environment variables:', missingVars.join(', '));
  console.error('Please check your .env file.');
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Additional options for better connection handling
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000,
  timeout: 10000,
  // Enable multiple statements if needed
  multipleStatements: false,
};

// Test connection on startup
let db;
try {
  db = await mysql.createPool(dbConfig);
  
  // Test the connection
  const connection = await db.getConnection();
  console.log('✅ Database connection successful!');
  console.log(`   Connected to: ${dbConfig.host}`);
  console.log(`   Database: ${dbConfig.database}`);
  connection.release();
} catch (error) {
  console.error('❌ Database connection failed!');
  console.error('Error details:', error.message);
  
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('\n💡 Possible solutions:');
    console.error('   1. Check your DB_USER and DB_PASS in .env file');
    console.error('   2. Verify your IP is whitelisted in Hostinger MySQL Remote Access');
    console.error('   3. For local development, you may need to:');
    console.error('      - Add your IP to Hostinger MySQL Remote Access settings');
    console.error('      - Or use SSH tunneling to connect through Hostinger server');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Possible solutions:');
    console.error('   1. Check your DB_HOST in .env file');
    console.error('   2. Verify the MySQL server is running');
  }
  
  // Still create the pool so the app doesn't crash immediately
  // But it will fail when trying to use it
  db = await mysql.createPool(dbConfig);
}

export { db };