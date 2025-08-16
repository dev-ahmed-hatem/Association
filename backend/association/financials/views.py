from django.db.models import RestrictedError
from rest_framework.viewsets import ModelViewSet
from .serializers import BankAccountSerializer, TransactionTypeSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext_lazy as _

from .models import BankAccount, TransactionType


class BankAccountViewSet(ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super(BankAccountViewSet, self).destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {"detail": _("لا يمكن حذف جهة العمل لارتباطها بأعضاء موجودين")},
                status=status.HTTP_400_BAD_REQUEST
            )


class TransactionTypeViewSet(ModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super(TransactionTypeViewSet, self).destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {"detail": _("لا يمكن حذف نوع المعاملة لارتباطها بسجلات مالية موجودة")},
                status=status.HTTP_400_BAD_REQUEST
            )
