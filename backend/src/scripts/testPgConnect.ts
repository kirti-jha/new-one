import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
  console.log(`📡 Testing connection with pg library to: ${connectionString?.replace(/:[^:@]+@/, ":****@")}`);
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Connection successful with pg library!");
    const res = await client.query('SELECT NOW()');
    console.log("Current time from DB:", res.rows[0].now);
    await client.end();
  } catch (err: any) {
    console.error("❌ Connection failed with pg library:", err.message);
    process.exit(1);
  }
}

testConnection();
