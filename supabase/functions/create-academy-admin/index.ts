import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { academy_name, academy_subdomain, admin_full_name, admin_email, admin_password, modules_config } = await req.json()
    console.log('Received payload:', { academy_name, academy_subdomain, admin_full_name, admin_email });

    // Check if user with this email already exists
    const { data: existingUsers, error: userListError } = await supabaseAdmin.auth.admin.listUsers();
    console.log('existingUsers:', JSON.stringify(existingUsers, null, 2));
    if (userListError) {
      throw new Error(`Failed to list users: ${userListError.message}`);
    }

    const userExists = existingUsers.users.some(u => u.email === admin_email);
    if (userExists) {
      throw new Error(`User with email ${admin_email} already exists.`);
    }

    // Create the auth user first
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true,
      user_metadata: {
        full_name: admin_full_name,
        admin_created: true
      }
    })

    if (authError) {
      console.error('Auth user creation failed:', authError);
      throw authError
    }

    console.log('authData:', JSON.stringify(authData, null, 2));

    if (!authData || !authData.user) {
      console.error('Auth user creation response is invalid:', authData);
      throw new Error('Failed to create user: Invalid response from authentication service.');
    }

    const authUser = authData.user;
    console.log('Auth user created successfully:', authUser.id);

    // Now call the database function with the real user_id
    console.log('Calling database function create_new_academy_with_user...');
    const { data: result, error: dbError } = await supabaseAdmin.rpc('create_new_academy_with_user', {
      academy_name,
      academy_subdomain,
      admin_full_name,
      admin_email,
      admin_password, // Note: consider if you need to pass this to the DB function
      modules_config: modules_config || {},
      user_id: authUser.id
    })

    if (dbError) {
      console.error('Database function failed:', dbError);
      // If database creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw dbError
    }
    console.log('Database function succeeded:', result);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...result,
          user_id: authUser.user.id,
          message: 'Academy and admin user created successfully!'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})