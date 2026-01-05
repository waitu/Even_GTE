import os
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(username="admin", hashed_password=get_password_hash("admin123"), is_admin=True)
        db.add(admin)
        db.commit()
    db.close()

if __name__ == "__main__":
    seed_admin()
