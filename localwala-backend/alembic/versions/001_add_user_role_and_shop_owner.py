"""add user role and shop owner

Revision ID: 001
Revises: 
Create Date: 2026-04-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type for user role
    user_role_enum = postgresql.ENUM('user', 'vendor', 'admin', name='userrole', create_type=False)
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    # Add role column to users table
    op.add_column('users', sa.Column('role', sa.Enum('user', 'vendor', 'admin', name='userrole'), nullable=False, server_default='user'))
    
    # Add owner_id column to shops table
    op.add_column('shops', sa.Column('owner_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_shops_owner_id', 'shops', 'users', ['owner_id'], ['id'])


def downgrade() -> None:
    # Remove foreign key and owner_id column
    op.drop_constraint('fk_shops_owner_id', 'shops', type_='foreignkey')
    op.drop_column('shops', 'owner_id')
    
    # Remove role column
    op.drop_column('users', 'role')
    
    # Drop enum type
    user_role_enum = postgresql.ENUM('user', 'vendor', 'admin', name='userrole')
    user_role_enum.drop(op.get_bind(), checkfirst=True)
