-- Check what permissions the anon role has on the public schema and Users table
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon' AND table_name = 'Users' AND table_schema = 'public';

-- Check schema-level permissions
SELECT schema_name, schema_owner
FROM information_schema.schemata
WHERE schema_name = 'public';

-- Check if anon has usage on public schema
SELECT grantee, privilege_type
FROM information_schema.usage_privileges
WHERE grantee = 'anon' AND object_schema = 'public';
