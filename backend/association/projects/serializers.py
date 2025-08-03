from django.conf import settings
from rest_framework import serializers
from .models import Project, Task
from employees.serializers import DepartmentSerializer


class ProjectReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='project-detail')
    status = serializers.StringRelatedField(source="get_status_display")
    supervisors = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    progress_started = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(source="created_by.name")

    class Meta:
        model = Project
        fields = '__all__'

    def get_created_at(self, obj: Project) -> str:
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime('%Y-%m-%d %H:%M:%S')

    def get_progress_started(self, obj: Project) -> str | None:
        if obj.progress_started is not None:
            return obj.progress_started.astimezone(settings.CAIRO_TZ).strftime('%Y-%m-%d')
        else:
            return None

    def get_supervisors(self, obj: Project):
        return [{"id": s.id, "name": s.name, "is_active": s.is_active} for s in obj.supervisors.all()]


class ProjectListSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='project-detail')
    supervisors = serializers.SerializerMethodField()
    status = serializers.StringRelatedField(source="get_status_display")

    class Meta:
        model = Project
        fields = ['id', 'url', 'name', 'status', 'start_date', 'end_date', 'supervisors']

    def get_supervisors(self, obj: Project):
        return [{"id": s.id, "name": s.name} for s in obj.supervisors.all()]


class ProjectWriteSerializer(serializers.ModelSerializer):
    # used only to render the current data in the edit form
    current_supervisors = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

    def get_current_supervisors(self, obj: Project):
        return [{"id": sup.id, "name": sup.name, "is_active": sup.is_active} for sup in obj.supervisors.all()]

    def create(self, validated_data):
        project = super(ProjectWriteSerializer, self).create(validated_data)
        auth_user = self.context['request'].user
        project.created_by = auth_user
        project.save()
        return project


class TaskReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='task-detail')
    status = serializers.StringRelatedField(source="get_status_display")
    priority = serializers.StringRelatedField(source="get_priority_display")
    assigned_to = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    departments = DepartmentSerializer(many=True, read_only=True)
    created_at = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(source="created_by.name")

    class Meta:
        model = Task
        fields = '__all__'

    def get_assigned_to(self, obj: Task):
        return [{"name": emp.name, "id": emp.id, "is_active": emp.is_active} for emp in obj.assigned_to.all()]

    def get_project(self, obj: Task):
        if obj.project:
            return {"name": obj.project.name, "id": obj.project.id}
        return None

    def get_created_at(self, obj: Project) -> str:
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime('%Y-%m-%d %H:%M:%S')


class TaskListSerializer(serializers.ModelSerializer):
    status = serializers.StringRelatedField(source="get_status_display")
    priority = serializers.StringRelatedField(source="get_priority_display")
    project = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'priority', 'project', 'due_date']

    def get_project(self, obj: Task):
        if obj.project:
            return {"name": obj.project.name, "id": obj.project.id}


class TaskWriteSerializer(serializers.ModelSerializer):
    # used only to render the current data in the edit form
    currently_assigned = serializers.SerializerMethodField(read_only=True)
    current_project = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

    def create(self, validated_data):
        task = super(TaskWriteSerializer, self).create(validated_data)

        # mark project as ongoing if it is completed
        if task.project.status == "completed":
            task.project.status = "ongoing"
            task.project.save()

        auth_user = self.context['request'].user
        task.created_by = auth_user
        task.save()
        return task

    def get_currently_assigned(self, obj: Task):
        return [{"name": emp.name, "id": emp.id, "is_active": emp.is_active} for emp in obj.assigned_to.all()]

    def get_current_project(self, obj: Task):
        return {"name": obj.project.name, "id": obj.project.id}
