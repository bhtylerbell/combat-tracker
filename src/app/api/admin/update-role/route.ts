import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    
    // Check if current user is admin
    const currentUser = await client.users.getUser(currentUserId);
    const currentUserRole = currentUser.publicMetadata?.role as string;
    
    if (!['admin', 'super_admin'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { targetUserId, newRole } = await request.json();

    // Validate the new role
    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Super admin restriction: only super_admin can assign admin roles
    if (newRole === 'admin' && currentUserRole !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin access required to assign admin role' }, { status: 403 });
    }

    // Get target user and check permissions
    const targetUser = await client.users.getUser(targetUserId);
    const targetUserRole = targetUser.publicMetadata?.role as string;

    // Don't allow admins to modify super_admin users
    if (targetUserRole === 'super_admin' && currentUserRole !== 'super_admin') {
      return NextResponse.json({ error: 'Cannot modify super admin users' }, { status: 403 });
    }

    // Update the user's role in metadata
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role: newRole,
        roleUpdatedBy: currentUserId,
        roleUpdatedAt: new Date().toISOString(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${newRole}` 
    });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
