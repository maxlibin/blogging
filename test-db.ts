import 'dotenv/config';
import { db } from './src/lib/db';
import { usersTable, postsTable } from './src/lib/db/schema';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to query the users table
    const users = await db.select().from(usersTable);
    console.log('✓ Database connection successful!');
    console.log(`Found ${users.length} users in the database`);
    
    // Try to query the posts table
    const posts = await db.select().from(postsTable);
    console.log(`Found ${posts.length} posts in the database`);
    
    console.log('\n✓ Drizzle ORM setup complete!');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
