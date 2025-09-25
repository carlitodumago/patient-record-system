import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminAccount() {
  try {
    console.log('Creating admin account...');
    
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@patientrecord.system',
      password: 'admin123',
      user_metadata: {
        username: 'admin',
        role: 'admin',
        full_name: 'System Administrator'
      },
      email_confirm: true // Auto-confirm the email
    });

    if (error) {
      console.error('Error creating admin account:', error);
      return;
    }

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@patientrecord.system');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    console.log('🆔 User ID:', data.user.id);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminAccount();