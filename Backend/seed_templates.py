from app.core.database import SessionLocal
from app.models.template import InvitationTemplate

DEFAULT_COMPANY_NAME = "CÔNG TY TNHH CÔNG NGHỆ VÀ DỊCH VỤ GTE"


def seed_templates():
    db = SessionLocal()
    try:
        exists = db.query(InvitationTemplate).filter(InvitationTemplate.name == "GTE - Year End").first()
        if not exists:
            t = InvitationTemplate(
                name="GTE - Year End",
                company_name=DEFAULT_COMPANY_NAME,
                title="Lễ tổng kết cuối năm",
                content=(
                    "Trân trọng mời anh/chị tham dự sự kiện YEAR END PARTY.\n"
                    "Sự hiện diện của anh/chị sẽ là niềm vinh dự lớn của chúng tôi.\n\n"
                    "Trân trọng,\nBan tổ chức"
                ),
                schedule=[
                    {"time": "18:00", "label": "Đón khách & Check-in"},
                    {"time": "19:00", "label": "Khai mạc"},
                    {"time": "19:30", "label": "Nhập tiệc"},
                ],
            )
            db.add(t)
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_templates()
