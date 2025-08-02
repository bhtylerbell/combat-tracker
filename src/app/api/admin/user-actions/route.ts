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

    const { targetUserId, action } = await request.json();

    if (!['ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "ban" or "unban"' }, { status: 400 });
    }

    // Get target user and check permissions
    const targetUser = await client.users.getUser(targetUserId);
    const targetUserRole = targetUser.publicMetadata?.role as string;

    // Don't allow admins to ban super_admin users
    if (targetUserRole === 'super_admin' && currentUserRole !== 'super_admin') {
      return NextResponse.json({ error: 'Cannot ban super admin users' }, { status: 403 });
    }

    // Don't allow users to ban themselves
    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 403 });
    }

    if (action === 'ban') {
      await client.users.banUser(targetUserId);
      
      // Update metadata to track ban info
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          bannedBy: currentUserId,
          bannedAt: new Date().toISOString(),
        }
      });
    } else {
      await client.users.unbanUser(targetUserId);
      
      // Update metadata to track unban info
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          unbannedBy: currentUserId,
          unbannedAt: new Date().toISOString(),
          bannedBy: undefined,
          bannedAt: undefined,
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${action === 'ban' ? 'banned' : 'unbanned'} successfully` 
    });
  } catch (error) {
    console.error('User ban/unban error:', error);
    return NextResponse.json({ error: 'Failed to perform user action' }, { status: 500 });
  }
}
