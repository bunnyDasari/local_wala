-- LocalWala Database Migration
-- Adds user roles and shop ownership

-- 1. Create user role enum
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('user', 'vendor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role userrole NOT NULL DEFAULT 'user';

-- 3. Add owner_id to shops table
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id);

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. Update demo user to be a vendor (optional)
UPDATE users 
SET role = 'vendor' 
WHERE email = 'demo@localwala.in';

-- 6. Link first shop to demo vendor (optional)
UPDATE shops 
SET owner_id = (SELECT id FROM users WHERE email = 'demo@localwala.in' LIMIT 1)
WHERE id = 1;

-- Verify changes
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_users, role FROM users GROUP BY role;
SELECT COUNT(*) as shops_with_owner FROM shops WHERE owner_id IS NOT NULL;
