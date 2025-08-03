from math import floor
from datetime import datetime

from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from .models import Project, Task
from .serializers import ProjectListSerializer, ProjectWriteSerializer, ProjectReadSerializer, TaskReadSerializer, \
    TaskWriteSerializer, TaskListSerializer
from django.db.models import Q
from django.utils.translation import gettext_lazy as _


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectWriteSerializer
        return ProjectListSerializer

    def get_queryset(self):
        search = self.request.query_params.get('search', None)
        status_filters = self.request.query_params.get('status_filters', None)
        queryset = Project.objects.all()

        if search is not None:
            queryset = queryset.filter(name__icontains=search)

        if status_filters:
            today = datetime.today().astimezone(settings.CAIRO_TZ).date()
            filters = status_filters.split(",")

            overdue_filter = Q(end_date__lt=today, status__in=["ongoing", "paused"])
            normal_status_filter = Q(status__in=filters)

            if "overdue" in filters:
                queryset = queryset.filter(normal_status_filter | overdue_filter)
            else:
                queryset = queryset.filter(normal_status_filter).exclude(overdue_filter)

        return queryset

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'detail': _('مشروع غير موجود')}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')

        # declare progress start date as now
        if new_status == "ongoing" and project.status == "pending-approval":
            project.progress_started = datetime.now()

        if not project.remaining_tasks().exists():
            new_status = "completed"

        project.status = new_status
        project.save()
        return Response({'status': project.get_status_display()}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def detailed(self, request, pk=None):
        try:
            project = Project.objects.get(pk=pk)
        except Exception:
            return Response({"detail": _("مشروع غير موجود")}, status=status.HTTP_404_NOT_FOUND)
        tasks = Task.objects.filter(project=project)
        serialized_tasks = TaskListSerializer(tasks, many=True, context={'request': request}).data
        serializer = ProjectReadSerializer(project, context={"request": request}).data
        stats = calculate_tasks_stats(project.id)
        return Response({**serializer, "tasks": serialized_tasks, "stats": stats}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            project = Project.objects.get(id=pk)
            serializer = ProjectWriteSerializer(project, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('مشروع غير موجود')}, status=status.HTTP_404_NOT_FOUND)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskWriteSerializer
        return TaskListSerializer

    def get_queryset(self):
        search = self.request.query_params.get('search', None)
        status_filters = self.request.query_params.get('status_filters', None)
        priority_filters = self.request.query_params.get('priority_filters', None)
        project_id = self.request.query_params.get("project_id", None)
        queryset = Task.objects.all()

        if project_id is not None:
            queryset = queryset.filter(project__id=project_id)

        if search is not None:
            queryset = queryset.filter(title__icontains=search)

        if status_filters is not None:
            today = datetime.today().astimezone(settings.CAIRO_TZ).date()
            filters = status_filters.split(",")

            overdue_filter = Q(due_date__lt=today, status="incomplete")
            normal_status_filter = Q(status__in=filters)

            if "overdue" in filters:
                queryset = queryset.filter(normal_status_filter | overdue_filter)
            else:
                queryset = queryset.filter(normal_status_filter).exclude(overdue_filter)

        if priority_filters is not None:
            filters = priority_filters.split(",")
            queryset = queryset.filter(priority__in=filters)

        return queryset

    @action(detail=True, methods=["get"])
    def detailed(self, request, pk=None):
        try:
            task = Task.objects.get(pk=pk)
            project_tasks = Task.objects.filter(project=task.project)
            project_tasks_serialized = TaskListSerializer(project_tasks, many=True, context={'request': request}).data
        except Task.DoesNotExist:
            return Response({"detail": _("مهمة غير موجودة")}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskReadSerializer(task, context={"request": request}).data
        return Response({**serializer, "project_tasks": project_tasks_serialized}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def switch_state(self, request, pk=None):
        try:
            task = Task.objects.get(pk=pk)
            project = task.project
            updated_project = False

            if task.status == "completed":
                task.status = "incomplete"
                # Downgrade project status only if it was marked as completed
                if project.status == "completed":
                    project.status = "ongoing"
                    updated_project = True
            else:
                task.status = "completed"
                # Check if this was the last incomplete task
                has_remaining_tasks = project.remaining_tasks().exclude(pk=task.pk).exists()
                if not has_remaining_tasks:
                    project.status = "completed"
                    updated_project = True

            task.save()
            if updated_project:
                project.save()

            return Response({"status": task.get_status_display()}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': _('مهمة غير موجودة')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            task = Task.objects.get(id=pk)
            serializer = TaskWriteSerializer(task, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('مهمة غير موجودة')}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def projects_stats(request):
    today = datetime.today().astimezone(settings.CAIRO_TZ).date()
    total = Project.objects.count()
    ongoing = Project.objects.filter(status="ongoing").count()
    completed = Project.objects.filter(status="completed").count()
    pending_approval = Project.objects.filter(status="pending-approval").count()
    paused = Project.objects.filter(status="paused").count()
    overdue = Project.objects.filter((Q(status="ongoing") | Q(status="paused")) & Q(end_date__lt=today)).count()
    return Response(data={
        'total': total,
        'ongoing': ongoing,
        'completed': completed,
        'pending_approval': pending_approval,
        'paused': paused,
        'overdue': overdue
    }, status=status.HTTP_200_OK)


def calculate_tasks_stats(project_id=None):
    today = datetime.today().astimezone(settings.CAIRO_TZ).date()
    if project_id is not None:
        tasks = Task.objects.filter(project__id=project_id)
    else:
        tasks = Task.objects.all()
    total = tasks.count()
    completed = tasks.filter(status="completed").count()
    overdue = tasks.filter(Q(status="incomplete") & Q(due_date__lt=today)).count()
    incomplete = total - completed
    rate = 0 if total == 0 else floor((completed / total) * 100)

    return {
        'total': total,
        'completed': completed,
        'incomplete': incomplete,
        'overdue': overdue,
        'rate': rate
    }


@api_view(["GET"])
def tasks_stats(request):
    stats = calculate_tasks_stats()
    return Response(stats, status=status.HTTP_200_OK)
