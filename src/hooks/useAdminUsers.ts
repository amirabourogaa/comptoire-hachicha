import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================
// 🔄 MERN API (décommentez pour utiliser le backend externe)
// ============================================================
// import { authService } from '@/services/api';

export type AdminRole = 'super_admin' | 'admin';
export type AdminSection = 'products' | 'categories' | 'orders' | 'coupons' | 'hero_slides' | 'settings' | 'admin_users' | 'vendors';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  permissions: AdminSection[];
}

export const ALL_SECTIONS: { value: AdminSection; label: string }[] = [
  { value: 'products', label: 'Produits' },
  { value: 'categories', label: 'Catégories' },
  { value: 'orders', label: 'Panier & Commandes' },
  { value: 'coupons', label: 'Coupons' },
  { value: 'hero_slides', label: 'Slides Hero' },
  { value: 'settings', label: 'Paramètres' },
  { value: 'admin_users', label: 'Gestion Admins' },
  { value: 'vendors', label: 'Marketplace (Vendeurs, Approbations, Messages)' },
];

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: adminUsers = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer tous les utilisateurs admin
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // const users = await authService.getAll(token);
      // return users.map(user => ({
      //   id: user.id,
      //   user_id: user.id,
      //   email: user.email,
      //   role: user.role as AdminRole,
      //   created_at: user.created_at,
      //   permissions: user.permissions as AdminSection[],
      // }));

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Get all permissions
      const { data: permissions, error: permError } = await supabase
        .from('admin_permissions')
        .select('*');

      if (permError) throw permError;

      // For each user, we need to get their email from auth
      // Since we can't query auth.users directly, we'll store email in a separate way
      // For now, we'll use the user_id and hope admins remember who they added
      // In production, you'd want to store email in user_roles or have a profiles table
      
      const adminList: AdminUser[] = roles.map((role: any) => ({
        id: role.id,
        user_id: role.user_id,
        email: '', // Will be fetched separately
        role: role.role as AdminRole,
        created_at: role.created_at,
        permissions: permissions
          .filter((p: any) => p.user_id === role.user_id)
          .map((p: any) => p.section as AdminSection),
      }));

      return adminList;
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      role, 
      permissions 
    }: { 
      email: string; 
      password: string; 
      role: AdminRole; 
      permissions: AdminSection[] 
    }) => {
      // ============================================================
      // 🔄 MERN API - Créer un administrateur
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // const newUser = await authService.create({ email, password, role, permissions }, token);
      // return { userId: newUser.id, email: newUser.email };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      // Create the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Échec de la création du compte');

      const userId = authData.user.id;

      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (roleError) throw roleError;

      // Add permissions if not super_admin (super_admin has all permissions)
      if (role !== 'super_admin' && permissions.length > 0) {
        const permissionRows = permissions.map(section => ({
          user_id: userId,
          section,
        }));

        const { error: permError } = await supabase
          .from('admin_permissions')
          .insert(permissionRows);

        if (permError) throw permError;
      }

      return { userId, email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Administrateur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      permissions 
    }: { 
      userId: string; 
      permissions: AdminSection[] 
    }) => {
      // ============================================================
      // 🔄 MERN API - Modifier les permissions
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await authService.updatePermissions(userId, permissions, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissions.length > 0) {
        const permissionRows = permissions.map(section => ({
          user_id: userId,
          section,
        }));

        const { error: insertError } = await supabase
          .from('admin_permissions')
          .insert(permissionRows);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Permissions mises à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      // ============================================================
      // 🔄 MERN API - Supprimer un administrateur
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // await authService.delete(userId, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      // Delete permissions first
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', userId);

      // Delete role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Administrateur supprimé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  return {
    adminUsers,
    isLoading,
    error,
    createAdmin: createAdminMutation.mutate,
    isCreating: createAdminMutation.isPending,
    updatePermissions: updatePermissionsMutation.mutate,
    isUpdating: updatePermissionsMutation.isPending,
    deleteAdmin: deleteAdminMutation.mutate,
    isDeleting: deleteAdminMutation.isPending,
  };
};

// Hook to check current user's permissions
export const useCurrentAdminPermissions = () => {
  const [permissions, setPermissions] = useState<AdminSection[]>([]);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      // ============================================================
      // 🔄 MERN API - Vérifier les permissions de l'utilisateur courant
      // ============================================================
      // const token = authService.getToken();
      // if (!token) {
      //   setIsLoading(false);
      //   return;
      // }
      // // Décoder le token JWT pour récupérer le rôle et les permissions
      // try {
      //   const payload = JSON.parse(atob(token.split('.')[1]));
      //   // Récupérer les infos utilisateur depuis l'API
      //   const users = await authService.getAll(token);
      //   const currentUser = users.find(u => u.id === payload.id);
      //   if (currentUser) {
      //     setRole(currentUser.role as AdminRole);
      //     if (currentUser.role === 'super_admin') {
      //       setPermissions(ALL_SECTIONS.map(s => s.value));
      //     } else {
      //       setPermissions(currentUser.permissions as AdminSection[]);
      //     }
      //   }
      // } catch (e) {
      //   console.error('Erreur décodage token:', e);
      // }
      // setIsLoading(false);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData) {
        setRole(roleData.role as AdminRole);
        
        // Super admin has all permissions
        if (roleData.role === 'super_admin') {
          setPermissions(ALL_SECTIONS.map(s => s.value));
        } else {
          // Get specific permissions
          const { data: permData } = await supabase
            .from('admin_permissions')
            .select('section')
            .eq('user_id', user.id);

          if (permData) {
            setPermissions(permData.map(p => p.section as AdminSection));
          }
        }
      }

      setIsLoading(false);
    };

    fetchPermissions();
  }, []);

  const hasPermission = (section: AdminSection) => {
    return role === 'super_admin' || permissions.includes(section);
  };

  return { permissions, role, isLoading, hasPermission };
};
