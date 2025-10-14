import express from "express";
import supabase from '../config/supabase.js';
import { sendCredentialsEmail } from '../services/emailService.js';
import { sendCredentialsSMS } from '../services/smsService.js';

const router = express.Router();

// Generate username: firstname.lastname (lowercase) + counter if duplicate
const generateUsername = async (firstName, lastName) => {
  const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from('Users')
      .select('UserID')
      .eq('Username', username)
      .single();

    if (error && error.code === 'PGRST116') { // No rows found
      break;
    } else if (data) {
      username = `${baseUsername}${counter}`;
      counter++;
    } else {
      break;
    }
  }

  return username;
};

// Generate password: MM-DD-YY from birthdate
const generatePassword = (birthDate) => {
  const date = new Date(birthDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}-${day}-${year}`;
};

// Login route using Supabase Auth
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, // Assuming username is email for simplicity; adjust if needed
      password: password
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user role from Users table
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('RoleID, FirstLogin')
      .eq('UserID', data.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Failed to fetch user role' });
    }

    const { data: roleData } = await supabase
      .from('Role')
      .select('RoleName')
      .eq('RoleID', userData.RoleID)
      .single();

    const userResponse = {
      username: data.user.email,
      role: roleData.RoleName,
      fullName: data.user.user_metadata?.full_name || username,
      token: data.session.access_token,
      firstLogin: userData.FirstLogin
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Create account (admin only) with auto-credentials
router.post('/create-account', async (req, res) => {
  const { type, firstName, lastName, suffix, email, birthDate, contactNumber, address, gender } = req.body;

  if (!firstName || !lastName || !email || !birthDate) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const username = await generateUsername(firstName, lastName);
    const password = generatePassword(birthDate);

    // Get role ID
    const { data: roleData } = await supabase
      .from('Role')
      .select('RoleID')
      .eq('RoleName', type === 'staff' ? 'nurse' : 'patient')
      .single();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (authError) {
      return res.status(500).json({ message: 'Failed to create auth user' });
    }

    // Insert into Users table
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .insert({
        Username: username,
        Password: password, // Plain text for prototype
        Email: email,
        RoleID: roleData.RoleID,
        FirstLogin: true
      })
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Failed to create user record' });
    }

    // Insert into Staff or Patients table
    if (type === 'staff') {
      await supabase.from('Staff').insert({
        UserID: userData.UserID,
        FirstName: firstName,
        Surname: lastName,
        Suffix: suffix,
        ContactNumber: contactNumber
      });
    } else {
      await supabase.from('Patients').insert({
        UserID: userData.UserID,
        FirstName: firstName,
        Surname: lastName,
        Suffix: suffix,
        Address: address,
        Gender: gender,
        BirthDate: birthDate,
        ContactNumber: contactNumber
      });
    }

    // Send credentials
    const fullName = `${firstName} ${lastName}`;
    await sendCredentialsEmail(email, fullName, username, password);
    if (contactNumber) {
      await sendCredentialsSMS(contactNumber, fullName, username, password);
    }

    res.status(201).json({ message: 'Account created and credentials sent' });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Account creation failed' });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select(`
        UserID,
        Username,
        Email,
        Role:RoleID (RoleName),
        CreatedAt
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const { error } = await supabase
      .from('Users')
      .update({ Password: newPassword, FirstLogin: false })
      .eq('UserID', userId);

    if (error) {
      return res.status(500).json({ message: 'Failed to change password' });
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Password change failed' });
  }
});

export default router;
