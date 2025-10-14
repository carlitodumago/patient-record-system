import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xplnygndaqbtjnfltvtt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
