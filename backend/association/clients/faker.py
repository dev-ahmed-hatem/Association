import random
from datetime import date, timedelta
from users.models import User
from .models import Client, WorkEntity, MembershipType, MaritalStatus, RankChoices

# Ensure at least one admin user exists for created_by
admin_user = User.objects.first()
if not admin_user:
    admin_user = User.objects.create_superuser(
        username="admin",
        password="admin123",
        email="admin@example.com"
    )

# Step 1: Create some work entities
work_entities_names = ["وزارة الداخلية", "وزارة الدفاع", "شركة الأمن الوطني", "الحرس الملكي", "مؤسسة حماية"]
work_entities = []
for name in work_entities_names:
    entity, _ = WorkEntity.objects.get_or_create(name=name)
    work_entities.append(entity)

# Step 2: Example Arabic names list
names_list = [
    "أحمد علي", "محمد حسن", "سعيد عبد الله", "خالد عمر", "سلمان حسين",
    "طارق يوسف", "ماجد فهد", "ناصر إبراهيم", "حسن أحمد", "محمود سامي",
    "صالح عبد الرحمن", "فهد عادل", "عبد الله صالح", "رائد خالد", "عماد يوسف",
    "مصطفى محمد", "أيمن عبد الله", "خالد محمد", "محمد عادل", "عبد الرحمن علي"
]

# Step 3: Create 20+ fake clients
for i in range(35):
    name = random.choice(names_list)
    rank = random.choice(RankChoices.values)
    national_id = "".join([str(random.randint(0, 9)) for _ in range(14)])
    birth_year = random.randint(1965, 1998)
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)  # keep safe for all months
    birth_date = date(birth_year, birth_month, birth_day)
    phone_number = "05" + "".join([str(random.randint(0, 9)) for _ in range(8)])
    membership_type = random.choice(MembershipType.values)
    work_entity = random.choice(work_entities)
    membership_number = str(random.randint(1000, 9999))  # numeric only
    subscription_date = birth_date + timedelta(days=random.randint(20 * 365, 30 * 365)) + timedelta(
        days=random.randint(30, 200))
    marital_status = random.choice(MaritalStatus.values)
    graduation_year = random.randint(1995, 2020)
    class_rank = str(random.randint(1, 150))  # number only

    Client.objects.create(
        name=name,
        rank=rank,
        national_id=national_id,
        birth_date=birth_date,
        phone_number=phone_number,
        membership_type=membership_type,
        work_entity=work_entity,
        membership_number=membership_number,
        subscription_date=subscription_date,
        marital_status=marital_status,
        graduation_year=graduation_year,
        class_rank=class_rank,
        created_by=admin_user,
        subscription_fee=10000
    )

print("✅ Successfully created 35 fake clients")
