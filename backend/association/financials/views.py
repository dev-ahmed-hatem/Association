from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import RestrictedError
from rest_framework.viewsets import ModelViewSet

from clients.models import Client
from .serializers import BankAccountSerializer, TransactionTypeSerializer, FinancialRecordReadSerializer, \
    FinancialRecordWriteSerializer, RankFeeSerializer, SubscriptionWriteSerializer, SubscriptionReadSerializer, \
    InstallmentSerializer
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.translation import gettext_lazy as _
from datetime import datetime
from django.conf import settings
from .models import BankAccount, TransactionType, FinancialRecord, Subscription, RankFee, Installment


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
            return Response({**serializer, "editable": not record.transaction_type.system_related})
        except Exception:
            return Response({'detail': _('عملية غير موجودة')}, status=status.HTTP_404_NOT_FOUND)


class SubscriptionViewSet(ModelViewSet):
    queryset = Subscription.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SubscriptionWriteSerializer
        return SubscriptionReadSerializer


@api_view(["GET"])
@permission_classes((permissions.IsAuthenticated,))
def get_year_subscriptions(request):
    year = request.query_params.get("year", None)
    client_id = request.query_params.get("client", None)

    if not year:
        return Response({"detail": _("يجب إدخال السنة")}, status=status.HTTP_400_BAD_REQUEST)

    try:
        client = Client.objects.get(pk=client_id)
    except Client.DoesNotExist:
        return Response({"detail": _("عميل غير موجود")}, status=status.HTTP_404_NOT_FOUND)

    subscriptions = Subscription.objects.filter(date__year=year, client=client).order_by("date")

    subs = {
        sub.date.month: SubscriptionReadSerializer(sub, context={"request": request}).data
        for sub in subscriptions
    }

    return Response(subs, status=status.HTTP_200_OK)


class InstallmentViewSet(ModelViewSet):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Installment.objects.all()

        client_id = self.request.query_params.get("client", None)

        if client_id is not None:
            queryset = queryset.filter(client_id=client_id)

        return queryset

    @action(detail=True, methods=['patch'])
    def payment(self, request, pk=None):
        try:
            installment = Installment.objects.get(id=pk)
            data = request.data

            transaction_type, __ = TransactionType.objects.get_or_create(name="رسوم أقساط",
                                                                         type=TransactionType.Type.INCOME,
                                                                         system_related=True)
            financial_record = FinancialRecord.objects.create(
                amount=data["amount"],
                transaction_type=transaction_type,
                date=data["paid_at"],
                payment_method="قسط عضوية",
                notes=data.get("notes"),
                created_by=request.user,
            )
            installment.financial_record = financial_record
            installment.status = Installment.Status.PAID
            installment.amount = data["amount"]
            installment.paid_at = data["paid_at"]
            installment.save()

            return Response({"detail": _("تم تسجيل دفع القسط بنجاح")}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': _('كود قسط غير موجود')}, status=status.HTTP_404_NOT_FOUND)
