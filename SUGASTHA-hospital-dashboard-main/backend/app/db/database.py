from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Render (and some other hosts) hand out Postgres URLs starting with
# "postgres://", which SQLAlchemy 2.x no longer accepts — it requires the
# "postgresql://" scheme. Normalize it here so DATABASE_URL can be pasted
# in directly without editing.
_database_url = settings.DATABASE_URL
if _database_url.startswith("postgres://"):
    _database_url = _database_url.replace("postgres://", "postgresql://", 1)

# SQLite needs this extra arg to allow use across FastAPI's request threads;
# Postgres/other DBs don't accept it, so only pass it for sqlite URLs.
connect_args = {"check_same_thread": False} if _database_url.startswith("sqlite") else {}

engine = create_engine(_database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
