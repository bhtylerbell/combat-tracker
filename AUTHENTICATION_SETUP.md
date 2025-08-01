# Setting Up Authentication & Database

## Quick Setup Guide

### 1. Clerk Authentication Setup

1. **Create a Clerk Account**
   - Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
   - Sign up for a free account

2. **Create a New Application**
   - Click "Create Application" 
   - Choose a name like "Combat Tracker"
   - Select your preferred authentication methods (email/password, Google, etc.)

3. **Get Your API Keys**
   - In your Clerk dashboard, go to "API Keys"
   - Copy the "Publishable Key" and "Secret Key"

### 2. Supabase Database Setup

1. **Create a Supabase Account**
   - Go to [https://supabase.com/](https://supabase.com/)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose a name like "combat-tracker"
   - Set a database password

3. **Set Up Database Tables**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database_setup.sql`
   - Run the SQL to create tables and security policies

4. **Get Your API Keys**
   - Go to Settings > API
   - Copy the "Project URL", "anon public" key, and "service_role" key

### 3. Configure Environment Variables

Update your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxx

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Restart Your Development Server

```bash
npm run dev
```

## Features Enabled

Once authentication and database are set up, users can:

- ✅ Create accounts with email/password or social login
- ✅ Save combat encounters to cloud database
- ✅ Load previously saved combats from any device
- ✅ Manage their combat library with full CRUD operations
- ✅ Automatic migration from localStorage to cloud database
- ✅ Data security with Row Level Security (RLS)

## Database Architecture

- **Table**: `saved_combats`
- **Security**: Row Level Security ensures users only see their own data
- **Performance**: Indexed on `user_id` and `updated_at` for fast queries
- **Data Structure**: Combat data stored as JSONB for flexibility

## Migration from localStorage

The app automatically detects existing localStorage data and offers to migrate it to the cloud database when users first sign in.

## Security Notes

- User data is isolated per account using RLS policies
- API routes are protected with Clerk middleware
- Service role key is only used server-side for admin operations
- All user operations go through secure API endpoints

## Troubleshooting

**Common Issues:**

1. **"Unauthorized" errors**: Check that your Clerk API keys are correct
2. **Database connection errors**: Verify your Supabase URL and keys
3. **RLS policy errors**: Ensure the SQL setup was run correctly
4. **Migration issues**: Check browser console for detailed error messages

**Optional: Disable Authentication**

If you don't want to set up authentication, the app works perfectly without it:
- All existing features work with localStorage
- Export/import functionality remains available
- Simply ignore the signup/signin prompts in the sidebar
