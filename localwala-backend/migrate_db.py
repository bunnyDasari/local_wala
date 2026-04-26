"""
Database migration script to add role and owner_id columns
"""
import asyncio
import asyncpg
import os

async def run_migration():
    # Get DATABASE_URL from environment
    database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://localwala:localwala123@postgres:5432/localwala_db")
    
    # Convert asyncpg URL to plain postgresql URL for asyncpg.connect
    url = database_url.replace("postgresql+asyncpg://", "postgresql://")
    
    print("🔄 Connecting to database...")
    conn = await asyncpg.connect(url)
    
    try:
        print("📝 Creating user role enum...")
        try:
            await conn.execute("""
                CREATE TYPE userrole AS ENUM ('user', 'vendor', 'admin');
            """)
            print("✅ User role enum created")
        except asyncpg.exceptions.DuplicateObjectError:
            print("⚠️  User role enum already exists")
        
        print("📝 Adding role column to users table...")
        try:
            await conn.execute("""
                ALTER TABLE users 
                ADD COLUMN role userrole NOT NULL DEFAULT 'user';
            """)
            print("✅ Role column added to users")
        except asyncpg.exceptions.DuplicateColumnError:
            print("⚠️  Role column already exists")
        
        print("📝 Adding owner_id column to shops table...")
        try:
            await conn.execute("""
                ALTER TABLE shops 
                ADD COLUMN owner_id INTEGER REFERENCES users(id);
            """)
            print("✅ Owner_id column added to shops")
        except asyncpg.exceptions.DuplicateColumnError:
            print("⚠️  Owner_id column already exists")
        
        print("📝 Creating indexes...")
        try:
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
            """)
            print("✅ Indexes created")
        except Exception as e:
            print(f"⚠️  Index creation: {e}")
        
        print("\n🎉 Migration completed successfully!")
        
        # Show stats
        user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
        shop_count = await conn.fetchval("SELECT COUNT(*) FROM shops")
        print(f"\n📊 Database stats:")
        print(f"   Users: {user_count}")
        print(f"   Shops: {shop_count}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    asyncio.run(run_migration())
