
-- Drop existing policies to avoid conflicts, then recreate
DO $$ BEGIN
  -- Drop user_roles policies if they exist
  DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
  
  -- Drop admin_permissions policies if they exist
  DROP POLICY IF EXISTS "View permissions" ON public.admin_permissions;
  DROP POLICY IF EXISTS "Super admins can insert permissions" ON public.admin_permissions;
  DROP POLICY IF EXISTS "Super admins can update permissions" ON public.admin_permissions;
  DROP POLICY IF EXISTS "Super admins can delete permissions" ON public.admin_permissions;
END $$;

-- Recreate RLS policies for user_roles
CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR (user_id = auth.uid()));

CREATE POLICY "Super admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- Recreate RLS policies for admin_permissions
CREATE POLICY "View permissions" ON public.admin_permissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR (user_id = auth.uid()));

CREATE POLICY "Super admins can insert permissions" ON public.admin_permissions
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update permissions" ON public.admin_permissions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete permissions" ON public.admin_permissions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));
