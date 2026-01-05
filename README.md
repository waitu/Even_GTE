# Thiệp Mời

Repo structure:
- `Backend/`: FastAPI + Alembic + PostgreSQL
- `Frontend/`: Next.js (App Router) + Tailwind

## Tech Stack
- Python 3.11
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- JWT Auth (admin only)
- CORS enabled

## Setup

1. **Clone repo & install dependencies**
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Configure environment**
   - Copy `Backend/.env` and update DB credentials if needed.

3. **Run PostgreSQL**
   - Ensure PostgreSQL is running and database `thiepmoi` exists.

4. **Run Alembic migrations**
   ```bash
   cd Backend
   alembic upgrade head
   ```

5. **Seed admin user**
   - Run the provided seed script (see below).

6. **Start server**
   ```bash
   cd Backend
   uvicorn app.main:app --reload
   ```

## API Endpoints
- `POST /api/auth/login` (admin)
- `POST /api/invitations` (admin)
- `GET /api/invitations/{slug}` (public)
- `POST /api/invitations/{slug}/response` (public)

## Seed Admin User
Create a script `seed_admin.py`:
```python
import os
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(username="admin", hashed_password=get_password_hash("admin123"), is_admin=True)
db.add(admin)
db.commit()
db.close()
```
Run:
```bash
python seed_admin.py
```

---

## Notes
- Only published invitations are public.
- Each client can only confirm once (by IP/cookie).
- Slug is generated only when publishing.
