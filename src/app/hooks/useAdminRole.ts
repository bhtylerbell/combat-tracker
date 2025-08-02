import { useUser } from '@clerk/nextjs';

export const useAdminRole = () => {
  const { user } = useUser();
  
  const role = user?.publicMetadata?.role as string || 'user';
  const isAdmin = ['admin', 'super_admin'].includes(role);
  const isSuperAdmin = role === 'super_admin';
  
  return {
    isAdmin,
    isSuperAdmin,
    role
  };
};
