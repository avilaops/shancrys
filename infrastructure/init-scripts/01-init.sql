-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create initial tenant for development
INSERT INTO public."Users" ("Id", "TenantId", "Email", "PasswordHash", "Name", "Roles", "CreatedAt")
VALUES 
  (uuid_generate_v4(), uuid_generate_v4(), 'admin@shancrys.dev', '$2a$11$placeholder', 'Admin Dev', '["admin"]'::jsonb, NOW())
ON CONFLICT DO NOTHING;
