from django.conf import settings
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status

from financials.models import Installment, Subscription
from .models import Client, WorkEntity, RankChoices
from .serializers import WorkEntitySerializer, ClientListSerializer, ClientReadSerializer, ClientWriteSerializer
from django.utils.translation import gettext_lazy as _
from django.db.models import RestrictedError, Count, Sum, Value, CharField
from django.db.models.functions import TruncMonth, ExtractYear, ExtractMonth, Concat

from datetime import datetime


class WorkEntityViewSet(ModelViewSet):
    queryset = WorkEntity.objects.all()
    serializer_class = WorkEntitySerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {"detail": _("لا يمكن حذف جهة العمل لارتباطها بأعضاء موجودين")},
                status=status.HTTP_400_BAD_REQUEST
            )


class ClientViewSet(ModelViewSet):
    queryset = Client.objects.all()

    def get_queryset(self):
        queryset = Client.objects.all()

        search: str = self.request.query_params.get('search', None)
        search_type = self.request.query_params.get('search_type', "name__icontains")

        status_filters = self.request.query_params.get('status', [])
        rank_filters = self.request.query_params.get('rank', [])
        entities_filters = self.request.query_params.get('entities', [])
        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        if search is not None:
            queryset = queryset.filter(**{search_type: search})

        if status_filters == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filters == "retired":
            queryset = queryset.filter(is_active=False)

        if len(entities_filters) > 0:
            entities_filters = entities_filters.split(',')
            queryset = queryset.filter(work_entity__name__in=entities_filters)

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
            client = Client.objects.get(pk=pk)
            data = ClientReadSerializer(client, context={"request": self.request}).data
            return Response(data)
        except Exception:
            return Response({'detail': _('عميل غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def switch_active(self, request, pk=None):
        try:
            client = Client.objects.get(pk=pk)
            client.is_active = not client.is_active
            client.save()
            return Response({"is_active": client.is_active})
        except Exception:
            return Response({'detail': _('عضو غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            client = Client.objects.get(id=pk)
            serializer = ClientWriteSerializer(client, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('عضو غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def delete_financial_records(self, request, pk=None):
        try:
            client = Client.objects.get(id=pk)
            for i in Installment.objects.filter(client=client):
                i.delete()
            for s in Subscription.objects.filter(client=client):
                s.delete()
            if client.prepaid:
                client.prepaid.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception:
            return Response({'detail': _('عضو غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        try:
            return super(ClientViewSet, self).destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {"detail": _("لا يمكن حذف العميل لارتباطه بسجلات مالية موجودة")},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET"])
def get_home_stats(request):
    # Rank Count
    ranks = Client.objects.values("rank").annotate(total=Count("id"))
    rank_dict = {r["rank"]: r["total"] for r in ranks}

    all_rank_counts = [{"rank": choice.value, "العدد": rank_dict.get(choice.value, 0)} for choice in RankChoices]

    # Activity Status
    activity = Client.objects.values("is_active").annotate(total=Count("id"))
    active_dict = {a["is_active"]: a["total"] for a in activity}

    active_status = [
        {"name": "بالخدمة", "value": active_dict.get(True, 0)},
        {"name": "متقاعد", "value": active_dict.get(False, 0)},
    ]

    entities_count = WorkEntity.objects.annotate(count=Count("client")).values("name", "id", "count")

    # Subscription Growth
    today = datetime.today().astimezone(settings.CAIRO_TZ).date()
    start_date = today.replace(month=today.month - 6, day=1)

    month_totals = (Subscription.objects.filter(date__gte=start_date)
                    .annotate(month=TruncMonth("date"))
                    .annotate(
        month=Concat(ExtractYear("month"), Value("-"), ExtractMonth("month"), output_field=CharField(), ))
                    .values(
        "month").annotate(اشتراكات=Sum("amount")))

    data = {
        "rank_counts": all_rank_counts,
        "active_status": active_status,
        "entities_count": entities_count,
        "month_totals": month_totals,
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_home_financial_stats(request):
    pass
