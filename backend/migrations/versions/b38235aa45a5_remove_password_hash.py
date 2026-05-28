"""remove password_hash

Revision ID: b38235aa45a5
Revises: 050eb8c9f54e
Create Date: 2026-04-10 00:12:25.267051

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b38235aa45a5'
down_revision: Union[str, Sequence[str], None] = '050eb8c9f54e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name='alumni' 
            AND column_name='password_hash'
        ) THEN
            ALTER TABLE alumni DROP COLUMN password_hash;
        END IF;
    END $$;
    """)


def downgrade():
    op.add_column(
        'alumni',
        sa.Column('password_hash', sa.String(), nullable=True)
    )