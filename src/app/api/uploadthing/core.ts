import { auth, currentUser } from '@clerk/nextjs/server';

export async function requireClerkAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const clerkUser = await currentUser();

  return { userId, clerkUser };
}
