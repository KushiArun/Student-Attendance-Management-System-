import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { student_id, email, user_id } = await req.json()

    const { data, error } = await supabase
      .from('students')
      .update({ email, user_id })
      .eq('student_id', student_id)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
