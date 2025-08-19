from django.db.models.functions import ExtractMonth
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import RestrictedError
from rest_framework.viewsets import ModelViewSet
from .serializers import BankAccountSerializer, TransactionTypeSerializer, FinancialRecordReadSerializer, \
    FinancialRecordWriteSerializer, RankFeeSerializer
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.translation import gettext_lazy as _
from datetime import datetime
from django.conf import settings
from .models import BankAccount, TransactionType, FinancialRecord, Subscription, RankFee


class BankAccountViewSet(ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer


class TransactionTypeViewSet(ModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer

    def get_queryset(self):
        queryset = TransactionType.objects.all()

        type = self.request.query_params.get("type", None)

        if type is not None:
            queryset = queryset.filter(type=type)

        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            return super(TransactionTypeViewSet, self).destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {"detail": _("لا يمكن حذف نوع المعاملة لارتباطها بسجلات مالية موجودة")},
                status=status.HTTP_400_BAD_REQUEST
            )


class RankFeeViewSet(ModelViewSet):
    queryset = RankFee.objects.all()
    serializer_class = RankFeeSerializer


class FinancialRecordViewSet(ModelViewSet):
    queryset = FinancialRecord.objects.all()

    def get_queryset(self):
        queryset = FinancialRecord.objects.all()

        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        type = self.request.query_params.get("type", None)
        date_str = self.request.query_params.get("date", None)
        date = datetime.today().astimezone(settings.CAIRO_TZ).date()
        payment_methods = self.request.query_params.get('payment_methods', [])
        transaction_types = self.request.query_params.get('transaction_types', [])

        if date_str is not None:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        queryset = queryset.filter(date=date)

        if type is not None:
            queryset = queryset.filter(transaction_type__type=type)

        if len(payment_methods) > 0:
            payment_methods = payment_methods.split(',')
            queryset = queryset.filter(payment_method__in=payment_methods)

        if len(transaction_types) > 0:
            transaction_types = transaction_types.split(',')
            queryset = queryset.filter(transaction_type__name__in=transaction_types)

        if sort_by is not None:
            queryset = queryset.order_by(f"{order}{sort_by}")

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FinancialRecordWriteSerializer
        return FinancialRecordReadSerializer

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        try:
            record = FinancialRecord.objects.get(pk=pk)
            data = FinancialRecordReadSerializer(record, context={"request": self.request}).data
            return Response(data)
        except Exception:
            return Response({'detail': _('عملية غير موجودة')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            record = FinancialRecord.objects.get(id=pk)
            serializer = FinancialRecordWriteSerializer(record, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('عملية غير موجودة')}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes((permissions.IsAuthenticated,))
def get_year_subscriptions(request):
    year = request.query_params.get("year", None)
    client = request.query_params.get("client", None)
    if not year:
        return Response({"detail": _("يجب إدخال السنة")}, status=status.HTTP_400_BAD_REQUEST)

    subscriptions = Subscription.objects.filter(date__year=year, client=client).annotate(
        month=ExtractMonth("date")).values()
