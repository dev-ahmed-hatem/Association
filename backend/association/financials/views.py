import pytz
from rest_framework.decorators import action
from django.db.models import RestrictedError
from rest_framework.viewsets import ModelViewSet
from .serializers import BankAccountSerializer, TransactionTypeSerializer, FinancialRecordReadSerializer, \
    FinancialRecordWriteSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from datetime import datetime
from django.conf import settings
from .models import BankAccount, TransactionType, FinancialRecord


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


class FinancialRecordViewSet(ModelViewSet):
    queryset = FinancialRecord.objects.all()

    def get_queryset(self):
        queryset = FinancialRecord.objects.all()

        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        type = self.request.query_params.get("type", None)
        date_str = self.request.query_params.get("date", None)
        date = datetime.today().astimezone(settings.CAIRO_TZ).date()
        payment_method = self.request.query_params.get('payment_method', [])

        if date_str is not None:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        queryset = queryset.filter(date=date)

        if type is not None:
            queryset = queryset.filter(transaction_type__type=type)

        if len(payment_method) > 0:
            payment_method = payment_method.split(',')
            queryset = queryset.filter(payment_method__in=payment_method)

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
