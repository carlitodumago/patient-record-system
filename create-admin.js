import supabase from './server/config/supabase.js';

async function createAdminInDatabase() {
  try {
    // First, create the admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@baankm3clinic.ph',
      password: 'admin123'
    });

    if (authError) {
      console.error('Error creating admin in auth:', authError);
      // If user already exists, try to sign in instead
      if (authError.message.includes('already registered')) {
        console.log('Admin user already exists in auth, proceeding to database setup...');
      } else {
        return;
      }
    } else {
      console.log('Admin user created in Supabase Auth:', authData.user.id);
    }

    // Get the user ID (either from signup or we'll need to sign in to get it)
    let userId = authData?.user?.id;

    if (!userId) {
      // Try to sign in to get the user ID
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@baankm3clinic.ph',
        password: 'admin123'
      });

      if (signInError) {
        console.error('Error signing in:', signInError);
        return;
      }

      userId = signInData.user.id;
      console.log('Admin user ID from sign in:', userId);
    }

    // Get role ID for admin
    const { data: roleData, error: roleError } = await supabase
      .from('Role')
      .select('RoleID')
      .eq('RoleName', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Admin role not found:', roleError);
      return;
    }

    // Check if admin already exists in Users table
    const { data: existingUser } = await supabase
      .from('Users')
      .select('UserID')
      .eq('Username', 'admin')
      .single();

    if (existingUser) {
      console.log('Admin account already exists in database');
      return;
    }

    // Insert admin into Users table
    const { error: insertError } = await supabase
      .from('Users')
      .insert({
        UserID: userId.toString(), // Ensure it's a string
        Username: 'admin',
        Password: 'admin123', // Plain text for prototype
        Email: 'admin@baankm3clinic.ph',
        RoleID: roleData.RoleID,
        CreatedAt: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting admin into database:', insertError);
    } else {
      console.log('Admin account created in database successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Email: admin@baankm3clinic.ph');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminInDatabase();
