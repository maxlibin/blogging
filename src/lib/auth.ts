import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
import { usersTable } from './db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error('Unauthorized');
  }

  const user = await currentUser();
  
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user exists in database
  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  let dbUser = existingUsers[0];

  // Create user if doesn't exist
  if (!dbUser) {
    const newUsers = await db
      .insert(usersTable)
      .values({
        clerkId,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || user.firstName || null,
      })
      .returning();
    
    dbUser = newUsers[0];
  }

  return {
    id: dbUser.id,
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    name: dbUser.name,
  };
}
