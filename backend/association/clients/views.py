from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Client, WorkEntity
from .serializers import WorkEntitySerializer, ClientListSerializer, ClientReadSerializer, ClientWriteSerializer
from django.utils.translation import gettext_lazy as _


class WorkEntityViewSet(ModelViewSet):
    queryset = WorkEntity.objects.all()
    serializer_class = WorkEntitySerializer


class ClientViewSet(ModelViewSet):
    queryset = Client.objects.all()

    def get_queryset(self):
        queryset = Client.objects.all()

        search: str = self.request.query_params.get('search', None)

        status_filters = self.request.query_params.get('status', [])
        rank_filters = self.request.query_params.get('rank', [])
        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        if search is not None:
            queryset = queryset.filter(name__icontains=search)

        if status_filters == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filters == "retired":
            queryset = queryset.filter(is_active=False)

        if len(rank_filters) > 0:
            rank_filters = rank_filters.split(',')
            queryset = queryset.filter(rank__in=rank_filters)

        if sort_by is not None:
            queryset = queryset.order_by(f"{order}{sort_by}")

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ClientWriteSerializer
        return ClientListSerializer

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        try:
            employee = Client.objects.get(pk=pk)
            data = ClientReadSerializer(employee, context={"request": self.request}).data
            return Response(data)
        except Exception:
            return Response({'detail': _('عميل غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def switch_active(self, request, pk=None):
        try:
            employee = Client.objects.get(pk=pk)
            employee.is_active = not employee.is_active
            employee.save()
            return Response({"is_active": employee.is_active})
        except Exception:
            return Response({'detail': _('عميل غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            employee = Client.objects.get(id=pk)
            serializer = ClientWriteSerializer(employee, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('عميل غير موجود')}, status=status.HTTP_404_NOT_FOUND)
