import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { vendorId, email, password } = await req.json()

    if (!vendorId || !email || !password) {
      throw new Error('Missing required fields')
    }

    console.log('Creating vendor account for:', email, 'vendorId:', vendorId)

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if vendor already has an account linked
    const { data: existingVendor } = await supabaseAdmin
      .from('vendors')
      .select('user_id')
      .eq('id', vendorId)
      .single()

    if (existingVendor?.user_id) {
      throw new Error('Ce vendeur a déjà un compte')
    }

    let userId: string

    // Try to create user - if exists, get existing user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'vendor'
      }
    })

    if (authError) {
      console.log('Auth error code:', authError.message)
      
      // If user already exists, try to get existing user and update password
      if (authError.message?.includes('already been registered') || authError.message?.includes('email_exists')) {
        console.log('User exists, fetching existing user...')
        
        // Get existing user by email
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
          console.error('Error listing users:', listError)
          throw new Error('Impossible de récupérer l\'utilisateur existant')
        }

        const existingUser = usersData.users.find(u => u.email === email)
        
        if (!existingUser) {
          throw new Error('Utilisateur introuvable malgré l\'erreur d\'email existant')
        }

        // Check if this user is already linked to another vendor
        const { data: existingVendorRole } = await supabaseAdmin
          .from('vendor_roles')
          .select('vendor_id')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        if (existingVendorRole) {
          throw new Error('Cet email est déjà associé à un autre vendeur')
        }

        // Check if user is an admin
        const { data: adminRole } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        if (adminRole) {
          throw new Error('Cet email appartient à un compte administrateur')
        }

        // Update password for existing user
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password }
        )

        if (updateError) {
          console.error('Error updating password:', updateError)
          throw new Error('Impossible de mettre à jour le mot de passe')
        }

        userId = existingUser.id
        console.log('Using existing user:', userId)
      } else {
        throw authError
      }
    } else {
      if (!authData.user) {
        throw new Error('Échec de la création du compte')
      }
      userId = authData.user.id
      console.log('Created new user:', userId)
    }

    // Create vendor role
    const { error: roleError } = await supabaseAdmin
      .from('vendor_roles')
      .insert({
        user_id: userId,
        vendor_id: vendorId,
        role: 'vendor',
      })

    if (roleError) {
      console.error('Role error:', roleError)
      throw new Error('Erreur lors de la création du rôle vendeur')
    }

    // Link user_id to vendor
    const { error: vendorError } = await supabaseAdmin
      .from('vendors')
      .update({ user_id: userId })
      .eq('id', vendorId)

    if (vendorError) {
      console.error('Vendor error:', vendorError)
      // Rollback: delete role
      await supabaseAdmin.from('vendor_roles').delete().eq('user_id', userId)
      throw new Error('Erreur lors de la liaison du compte vendeur')
    }

    console.log('Vendor account created successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        userId,
        message: 'Compte vendeur créé avec succès'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
