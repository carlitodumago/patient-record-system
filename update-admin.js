import supabase from './server/config/supabase.js';

async function updateAdminUserID() {
  try {
    // Sign in as admin to get the user ID
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@baankm3clinic.ph',
      password: 'admin123'
    });

    if (error) {
      console.error('Error signing in:', error);
      return;
    }

    console.log('Admin user ID:', data.user.id);

    // Delete the old admin record
    const { error: deleteError } = await supabase
      .from('Users')
      .delete()
      .eq('Username', 'admin');

    if (deleteError) {
      console.error('Error deleting old admin record:', deleteError);
      return;
    }

    // Insert new admin record with correct UserID
    const { data: roleData } = await supabase
      .from('Role')
      .select('RoleID')
      .eq('RoleName', 'admin')
      .single();

    const { error: insertError } = await supabase
      .from('Users')
      .insert({
        UserID: data.user.id,
        Username: 'admin',
        Password: 'admin123',
        Email: 'admin@baankm3clinic.ph',
        RoleID: roleData.RoleID,
        FirstLogin: false
      });

    if (insertError) {
      console.error('Error inserting new admin record:', insertError);
    } else {
      console.log('Users table updated successfully');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateAdminUserID();
