import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    
    // Get the current user to check their role
    const currentUser = await client.users.getUser(userId);
    const userRole = currentUser.publicMetadata?.role as string;

    // Check if user is admin
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all users
    const userList = await client.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    });

    const users = userList.data.map((user: any) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata?.role || 'user',
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
