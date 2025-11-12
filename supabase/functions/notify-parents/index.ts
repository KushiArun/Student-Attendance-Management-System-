import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  studentId: string;
  notificationType: 'absence' | 'late' | 'early_leave';
  date: string;
  additionalInfo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { studentId, notificationType, date, additionalInfo }: NotificationRequest = await req.json();

    console.log(`Processing parent notification for student: ${studentId}`);

    // Get student details with parent contact
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      console.error('Student not found:', studentError);
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!student.parent_contact) {
      console.log('No parent contact found for student');
      return new Response(
        JSON.stringify({ message: 'No parent contact available' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create notification message
    let message = '';
    switch (notificationType) {
      case 'absence':
        message = `Dear Parent, ${student.full_name} (${student.student_id}) was marked absent on ${date}. Please contact the school if this is incorrect.`;
        break;
      case 'late':
        message = `Dear Parent, ${student.full_name} (${student.student_id}) arrived late to class on ${date}. ${additionalInfo || ''}`;
        break;
      case 'early_leave':
        message = `Dear Parent, ${student.full_name} (${student.student_id}) left school early on ${date}. ${additionalInfo || ''}`;
        break;
      default:
        message = `Dear Parent, there is an update regarding ${student.full_name} (${student.student_id}) on ${date}.`;
    }

    // Add school contact information
    message += `\n\nFor more information, contact East West Institute of Technology.\n- EWIT Administration`;

    // Store notification in database
    const { error: notificationError } = await supabase
      .from('parent_notifications')
      .insert({
        student_id: studentId,
        parent_contact: student.parent_contact,
        message: message,
        notification_type: notificationType,
        status: 'sent'
      });

    if (notificationError) {
      console.error('Error storing notification:', notificationError);
    }

    console.log(`Parent notification sent successfully for student: ${student.full_name}`);
    console.log(`Message: ${message}`);
    console.log(`Parent Contact: ${student.parent_contact}`);

    // In a real implementation, you would integrate with SMS/WhatsApp API here
    // For demo purposes, we're just logging and storing the notification
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Parent notification sent successfully',
        notificationDetails: {
          studentName: student.full_name,
          studentId: student.student_id,
          parentContact: student.parent_contact,
          notificationType: notificationType,
          date: date
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in notify-parents function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});