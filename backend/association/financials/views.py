from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import RestrictedError, Sum, Q, F, Value, DecimalField
from django.db.models.functions import Coalesce
from django.utils.dateparse import parse_date
from rest_framework.viewsets import ModelViewSet

from association.rest_framework_utils.custom_pagination import CustomPageNumberPagination
from clients.models import Client
from .serializers import BankAccountSerializer, TransactionTypeSerializer, FinancialRecordReadSerializer, \
    FinancialRecordWriteSerializer, RankFeeSerializer, SubscriptionWriteSerializer, SubscriptionReadSerializer, \
    InstallmentSerializer, LoanSerializer, RepaymentSerializer
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.translation import gettext_lazy as _
from datetime import datetime, date
from .models import BankAccount, TransactionType, FinancialRecord, Subscription, RankFee, Installment, Loan, Repayment
from uuid import uuid4


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
        from_date = self.request.query_params.get("from", None)
        to_date = self.request.query_params.get("to", None)
        payment_methods = self.request.query_params.get('payment_methods', [])
        transaction_types = self.request.query_params.get('transaction_types', [])

        if date_str is not None:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
            queryset = queryset.filter(date=date)

        if from_date is not None and to_date is not None:
            from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date = datetime.strptime(to_date, "%Y-%m-%d").date()
            queryset = queryset.filter(date__gte=from_date, date__lte=to_date)

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

            installment.status = Installment.Status.PAID
            installment.amount = data["amount"]
            installment.paid_at = data["paid_at"]
            installment.notes = data["notes"]
            installment.save()

            return Response({"detail": _("تم تسجيل دفع القسط بنجاح")}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': _('كود قسط غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def revoke(self, request, pk=None):
        try:
            installment = Installment.objects.get(id=pk)
            installment.status = Installment.Status.UNPAID
            installment.paid_at = None
            installment.notes = None
            installment.save()
            return Response({"detail": _("تم إلفاء دفع القسط بنجاح")}, status=status.HTTP_200_OK)

        except Exception:
            return Response({'detail': _('كود قسط غير موجود')}, status=status.HTTP_404_NOT_FOUND)


class LoanViewSet(ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer

    def get_queryset(self):
        queryset = Loan.objects.all()

        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        client_id = self.request.query_params.get("client_id", None)
        search = self.request.query_params.get("search")
        search_type = self.request.query_params.get('search_type', "name__icontains")

        if client_id is not None:
            queryset = queryset.filter(client_id=client_id)

        clients_qs = Client.objects.all()

        if search not in (None, ""):
            try:
                if search_type == "membership_number" and not search.isdigit():
                    raise ValueError("membership_number must be an integer")
                clients_qs = clients_qs.filter(**{search_type: search})
                queryset = queryset.filter(client__in=clients_qs)
            except ValueError:
                pass

        if sort_by is not None:
            queryset = queryset.order_by(f"{order}{sort_by}")

        return queryset


class RepaymentViewSet(ModelViewSet):
    queryset = Repayment.objects.all()
    serializer_class = RepaymentSerializer
    pagination_class = None  # repayments usually listed fully for a loan

    def get_queryset(self):
        queryset = Repayment.objects.all()

        loan_id = self.request.query_params.get("loan_id", None)
        if loan_id is not None:
            queryset = queryset.filter(loan_id=loan_id)

        client_id = self.request.query_params.get("client", None)
        if client_id is not None:
            queryset = queryset.filter(loan__client_id=client_id)

        return queryset

    @action(detail=True, methods=["patch"])
    def payment(self, request, pk=None):
        try:
            repayment = Repayment.objects.get(id=pk)
            data = request.data

            repayment.status = Repayment.Status.PAID
            repayment.amount = data["amount"]
            repayment.paid_at = data["paid_at"]
            repayment.notes = data["notes"]
            repayment.save()

            return Response({"detail": _("تم تسجيل دفع السداد بنجاح")}, status=status.HTTP_200_OK)

        except Repayment.DoesNotExist:
            return Response({"detail": _("كود السداد غير موجود")}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["patch"])
    def revoke(self, request, pk=None):
        try:
            repayment = Repayment.objects.get(id=pk)
            repayment.status = Repayment.Status.UNPAID
            repayment.paid_at = None
            repayment.notes = None
            repayment.save()

            if repayment.financial_record:
                repayment.financial_record.delete()

            return Response({"detail": _("تم إلغاء دفع السداد بنجاح")}, status=status.HTTP_200_OK)

        except Repayment.DoesNotExist:
            return Response({"detail": _("كود السداد غير موجود")}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def get_financials_stats(request):
    from_date = request.query_params.get("from")
    to_date = request.query_params.get("to")

    if not from_date or not to_date:
        return Response(
            {"detail": "Both 'from' and 'to' dates are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        from_date = parse_date(from_date)
        to_date = parse_date(to_date)
    except Exception:
        return Response(
            {"detail": "Invalid date format. Use YYYY-MM-DD."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ensure valid range
    if from_date > to_date:
        return Response(
            {"detail": "'from' date cannot be later than 'to' date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # incomes & expenses totals
    month_incomes = (
            FinancialRecord.objects.filter(
                date__range=[from_date, to_date],
                transaction_type__type=TransactionType.Type.INCOME,
            ).aggregate(Sum("amount"))["amount__sum"]
            or 0
    )
    month_expenses = (
            FinancialRecord.objects.filter(
                date__range=[from_date, to_date],
                transaction_type__type=TransactionType.Type.EXPENSE,
            ).aggregate(Sum("amount"))["amount__sum"]
            or 0
    )

    # accounts incomes
    accounts_incomes = (
        BankAccount.objects.annotate(
            value=Coalesce(
                Sum(
                    "financialrecord__amount",
                    filter=Q(
                        financialrecord__date__range=[from_date, to_date],
                        financialrecord__transaction_type__type=TransactionType.Type.INCOME,
                    ),
                ),
                Value(0),
                output_field=DecimalField(),
            )
        )
        .values("name", "value")
    )

    # accounts expenses
    accounts_expenses = (
        BankAccount.objects.annotate(
            value=Coalesce(
                Sum(
                    "financialrecord__amount",
                    filter=Q(
                        financialrecord__date__range=[from_date, to_date],
                        financialrecord__transaction_type__type=TransactionType.Type.EXPENSE,
                    ),
                ),
                Value(0),
                output_field=DecimalField(),
            )
        )
        .values("name", "value")
    )

    # income stats grouped by transaction type
    incomes_stats = (
        FinancialRecord.objects.filter(
            date__range=[from_date, to_date],
            transaction_type__type=TransactionType.Type.INCOME,
        )
        .values(name=F("transaction_type__name"), type=F("transaction_type__type"))
        .annotate(value=Sum("amount"))
        .order_by("-value")[:4]
    )

    # expense stats grouped by transaction type
    expenses_stats = (
        FinancialRecord.objects.filter(
            date__range=[from_date, to_date],
            transaction_type__type=TransactionType.Type.EXPENSE,
        )
        .values(name=F("transaction_type__name"), type=F("transaction_type__type"))
        .annotate(value=Sum("amount"))
        .order_by("-value")[:4]
    )

    return Response(
        {
            "accounts_incomes": accounts_incomes,
            "accounts_expenses": accounts_expenses,
            "transaction_stats": list(incomes_stats) + list(expenses_stats),
            "month_totals": {
                "incomes": month_incomes,
                "expenses": month_expenses,
                "net": month_incomes - month_expenses,
            },
        },
        status=status.HTTP_200_OK,
    )


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


@api_view(["GET"])
def get_month_subscriptions(request):
    month = request.query_params.get("month")
    year = request.query_params.get("year")
    search = request.query_params.get("search")
    paid_status = request.query_params.get("status", None)
    search_type = request.query_params.get('search_type', "name__icontains")

    cutoff = date(int(year), int(month), 1)

    if not month or not year:
        return Response({"detail": _("يجب تحديد الشهر والسنة")}, status=status.HTTP_400_BAD_REQUEST)

    clients_qs = Client.objects.filter(is_active=True, subscription_date__lt=cutoff).only("id", "name", "rank",
                                                                                          "membership_number")

    if search not in (None, ""):
        try:
            if search_type == "membership_number" and not search.isdigit():
                raise ValueError("membership_number must be an integer")
            clients_qs = clients_qs.filter(**{search_type: search})
        except ValueError:
            pass

    # Normalize paid_status
    if paid_status in ("", None):
        allowed_statuses = {"paid", "unpaid"}
    else:
        allowed_statuses = set(paid_status.split(","))

    clients = list(clients_qs.values("id", "name", "rank", "membership_number"))

    subs = Subscription.objects.filter(
        date__month=month, date__year=year
    ).select_related("client")
    subs_map = {s.client_id: s for s in subs}

    fees = {r.rank: r.fee for r in RankFee.objects.all()}

    results = []
    for client in clients:
        sub = subs_map.get(client["id"])
        if sub and "paid" in allowed_statuses:
            results.append({
                "id": sub.id,
                "client": client["name"],
                "client_id": client["id"],
                "membership_number": client["membership_number"],
                "rank": client["rank"],
                "amount": sub.amount,
                "status": "مدفوع",
                "paid_at": sub.paid_at,
                "date": sub.date,
                "notes": sub.notes,
            })
        elif not sub and "unpaid" in allowed_statuses:
            results.append({
                "id": str(uuid4()),  # temporary key
                "client": client["name"],
                "client_id": client["id"],
                "membership_number": client["membership_number"],
                "rank": client["rank"],
                "amount": fees.get(client["rank"], 0),
                "status": "غير مدفوع",
                "paid_at": None,
                "date": date(int(year), int(month), 1).strftime("%Y-%m-%d"),
                "notes": None,
            })

    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(results, request)
    if page is not None:
        return paginator.get_paginated_response(page)

    return Response(results)


@api_view(["GET"])
def get_month_installments(request):
    month = request.query_params.get("month")
    year = request.query_params.get("year")
    search = request.query_params.get("search", "")
    paid_status = request.query_params.get("status", [])
    search_type = request.query_params.get('search_type', "name__icontains")

    if not month or not year:
        return Response({"detail": _("يجب تحديد الشهر والسنة")}, status=status.HTTP_400_BAD_REQUEST)

    clients_qs = Client.objects.filter(is_active=True)

    if search not in (None, ""):
        try:
            if search_type == "membership_number" and not search.isdigit():
                raise ValueError("membership_number must be an integer")
            clients_qs = clients_qs.filter(**{search_type: search})
        except ValueError:
            pass

    installments = Installment.objects.filter(
        due_date__month=month, due_date__year=year, client__in=clients_qs
    ).select_related("client")

    if len(paid_status) > 0:
        status_filter = paid_status.split(',')
        installments = installments.filter(status__in=status_filter)

    results = [{
        **InstallmentSerializer(instance=ins, context={"request": request}).data,
        "client": ins.client.name,
        "client_id": ins.client.id,
        "membership_number": ins.client.membership_number,
        "rank": ins.client.rank,
    } for ins in installments]

    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(results, request)
    if page is not None:
        return paginator.get_paginated_response(page)

    return Response(results)
