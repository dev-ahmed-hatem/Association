from datetime import datetime

from rest_framework import viewsets, status

from financials.models import TransactionType
from .serializers import ProjectSerializer, ProjectTransactionReadSerializer, ProjectTransactionWriteSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Project, ProjectTransaction
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum, RestrictedError


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all()

        search = self.request.query_params.get('search', None)
        status_filters = self.request.query_params.get('status', None)
        from_date_str = self.request.query_params.get('from_date', None)
        to_date_str = self.request.query_params.get('to_date', None)
        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        if search is not None:
            queryset = queryset.filter(name__icontains=search)

        if status_filters:
            filters = status_filters.split(",")
            queryset = queryset.filter(status__in=filters)

        if from_date_str and to_date_str:
            from_date = datetime.strptime(from_date_str, '%Y-%m-%d')
            to_date = datetime.strptime(to_date_str, '%Y-%m-%d')

            queryset = queryset.filter(start_date__range=[from_date, to_date])

        if sort_by is not None:
            queryset = queryset.order_by(f"{order}{sort_by}")

        return queryset

    @action(detail=True, methods=['post'])
    def switch_status(self, request, pk=None):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'detail': _('مشروع غير موجود')}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')

        project.status = new_status
        project.save()
        return Response({'status': project.get_status_display()}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        try:
            return super(ProjectViewSet, self).destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {"detail": _("لا يمكن حذف المشروع لارتباطه بسجلات مالية موجودة")},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProjectTransactionViewSet(viewsets.ModelViewSet):
    queryset = ProjectTransaction.objects.all()
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()

        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Split into incomes & expenses
        incomes = queryset.filter(financial_record__transaction_type__type=TransactionType.Type.INCOME)
        expenses = queryset.filter(financial_record__transaction_type__type=TransactionType.Type.EXPENSE)

        # Serialize
        income_serializer = self.get_serializer(incomes, many=True)
        expense_serializer = self.get_serializer(expenses, many=True)

        # Totals
        total_incomes = incomes.aggregate(total=Sum("financial_record__amount"))["total"] or 0
        total_expenses = expenses.aggregate(total=Sum("financial_record__amount"))["total"] or 0

        response_data = {
            "incomes": {
                "transactions": income_serializer.data,
                "total": total_incomes,
            },
            "expenses": {
                "transactions": expense_serializer.data,
                "total": total_expenses,
            },
            "net": total_incomes - total_expenses,
        }

        return Response(response_data)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectTransactionWriteSerializer
        return ProjectTransactionReadSerializer
