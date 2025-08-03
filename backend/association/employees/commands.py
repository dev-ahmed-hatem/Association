# Generate random employees

import random
from datetime import date, timedelta
from .models import Employee, Department
from users.models import User


# Helper to generate a random date of birth
def random_birth_date(min_age=22, max_age=60):
    today = date.today()
    age = random.randint(min_age, max_age)
    return today - timedelta(days=age * 365)


# Ensure there are departments
departments = list(Department.objects.all())
if not departments:
    for i in range(3):
        departments.append(Department.objects.create(name=f"قسم {i + 1}"))

# Gender and marital status options
genders = ["male", "female"]
gender_display = {"male": "ذكر", "female": "أنثى"}
marital_statuses = ["single", "married", "divorced", "widowed"]
modes = ["remote", "on-site", "hybrid"]

for i in range(20):
    gender = random.choice(genders)
    birth_date = random_birth_date()
    Employee.objects.create(
        name=f"موظف {i + 1}",
        gender=gender,
        email=f"user{i + 1}@example.com",
        phone=f"01000{random.randint(100000, 999999)}",
        address=f"عنوان {i + 1}",
        birth_date=birth_date,
        employee_id=f"employee{i + 10}",
        national_id=f"{random.randint(10000000000000, 99999999999999)}",
        marital_status=random.choice(marital_statuses),
        position=f"وظيفة {i + 1}",
        hire_date=date.today() - timedelta(days=random.randint(30, 1000)),
        mode=random.choice(modes),
        department=random.choice(departments),
        created_by=User.objects.get(id=1)
    )
