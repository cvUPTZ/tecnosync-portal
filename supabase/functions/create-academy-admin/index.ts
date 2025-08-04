import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    // Create the auth user first
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true,
      user_metadata: {
        full_name: admin_full_name,
        role: 'director',
        admin_created: true
      }
    })

    if (authError) {
      throw authError
    }

    // Now call the database function with the real user_id
    const { data: result, error: dbError } = await supabaseAdmin.rpc('create_new_academy_with_user', {
      academy_name,
      academy_subdomain,
      admin_full_name,
      admin_email,
      admin_password,
      modules_config: modules_config || {},
      user_id: authUser.user.id
    })

    if (dbError) {
      // If database creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw dbError
    }

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