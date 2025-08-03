import random
import datetime
from django.utils import timezone
from projects.models import Project, Task
from employees.models import Employee, Department
from users.models import User

user = User.objects.get(id=1)


def generate_sample_data(created_by=user):
    employees = list(Employee.objects.all())
    departments = list(Department.objects.all())

    if len(employees) < 5 or len(departments) < 1:
        print("Ensure there are enough employees and departments in the database.")
        return

    project_statuses = ['in-progress', 'completed', 'pending-approval', 'paused', 'overdue']
    priorities = ['low', 'medium', 'high']
    task_statuses = ['completed', 'incomplete', 'overdue']

    # Create 20 Projects
    projects = []
    for i in range(20):
        name = f"مشروع {i + 1}"
        start_date = timezone.now().date() - datetime.timedelta(days=random.randint(0, 60))
        end_date = start_date + datetime.timedelta(days=random.randint(30, 90))
        supervisors = random.sample(employees, k=random.randint(1, 2))
        budget = random.randint(50000, 300000)

        project = Project.objects.create(
            name=name,
            status=random.choice(project_statuses),
            start_date=start_date,
            end_date=end_date,
            client=f"عميل {i + 1}",
            budget=budget,
            description=f"وصف لمشروع {i + 1}",
            created_by=created_by,
        )
        project.supervisors.set(supervisors)
        projects.append(project)

    # Create 40 Tasks
    for i in range(40):
        title = f"مهمة {i + 1}"
        due_date = timezone.now().date() + datetime.timedelta(days=random.randint(5, 60))
        assigned_to = random.sample(employees, k=random.randint(1, 3))
        task_departments = random.sample(departments, k=random.randint(1, min(2, len(departments))))
        task = Task.objects.create(
            title=title,
            status=random.choice(task_statuses),
            priority=random.choice(priorities),
            due_date=due_date,
            description=f"وصف لمهمة {i + 1}",
            project=random.choice(projects),
            created_by=created_by,
        )
        task.assigned_to.set(assigned_to)
        task.departments.set(task_departments)

    print("✅ Sample projects and tasks have been created.")
