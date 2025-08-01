import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Get user count from Clerk
    const userList = await client.users.getUserList({ limit: 1 });
    const totalUsers = userList.totalCount || 0;

    // Get active users (signed in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUserList = await client.users.getUserList({
      limit: 500,
      query: `last_sign_in_at:>${thirtyDaysAgo.toISOString()}`
    });
    const activeUsers = activeUserList.totalCount || 0;

    // Get combat count from Supabase (if available)
    let totalCombats = 0;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { count } = await supabase
          .from('saved_combats')
          .select('*', { count: 'exact', head: true });
        
        totalCombats = count || 0;
      }
    } catch (error) {
      console.warn('Could not fetch combat stats:', error);
    }

    const stats = {
      totalUsers,
      totalCombats,
      activeUsers,
      storageUsed: 'N/A' // Could be calculated from Supabase if needed
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
