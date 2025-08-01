import { useUser } from '@clerk/nextjs';

export const useAdminRole = () => {
  const { user } = useUser();
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const isSuperAdmin = user?.publicMetadata?.role === 'super_admin';
  
  return {
    isAdmin: isAdmin || isSuperAdmin,
    isSuperAdmin,
    role: user?.publicMetadata?.role as string || 'user'
  };
};
