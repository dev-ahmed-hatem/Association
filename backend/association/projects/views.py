from datetime import datetime

from rest_framework import viewsets, status
from .serializers import ProjectSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Project
from django.utils.translation import gettext_lazy as _


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all()

        search = self.request.query_params.get('search', None)
        status_filters = self.request.query_params.get('status_filters', None)
        from_date_str = self.request.query_params.get('from_date', None)
        to_date_str = self.request.query_params.get('to_date', None)

        if search is not None:
            queryset = queryset.filter(name__icontains=search)

        if status_filters:
            filters = status_filters.split(",")
            queryset = queryset.filter(status__in=filters)

        if from_date_str and to_date_str:
            from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
            to_date = datetime.strptime(to_date_str, '%Y-%m-%d')

            queryset = queryset.filter(start_date__range=[from_date, to_date])

        return queryset

    @action(detail=True, methods=['post'])
    def switch_status(self, request, pk=None):
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
