from django.db import transaction
from django.db.models import Sum

from financials.models import BankAccount, FinancialRecord, TransactionType
from .models import Project, ProjectTransaction
from rest_framework import serializers

from django.utils.translation import gettext_lazy as _


class ProjectSerializer(serializers.ModelSerializer):
    total_incomes = serializers.SerializerMethodField(read_only=True)
    total_expenses = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

    def get_total_incomes(self, obj: Project):
        return obj.total_incomes

    def get_total_expenses(self, obj: Project):
        return obj.total_expenses

    def create(self, validated_data):
        user = self.context['request'].user
        return super().create({**validated_data, "created_by": user})


class ProjectTransactionReadSerializer(serializers.ModelSerializer):
    amount = serializers.IntegerField(source="financial_record.amount")
    date = serializers.DateField(source="financial_record.date")

    class Meta:
        model = ProjectTransaction
        fields = '__all__'


class ProjectTransactionWriteSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=True,
        write_only=True,
        error_messages={
            "blank": _("يرجى إدخال المبلغ"),
            "null": _("المبلغ لا يمكن أن يكون فارغًا"),
            "invalid": _("يرجى إدخال قيمة رقمية صحيحة"),
        },
    )
    transaction_type = serializers.CharField(
        required=True,
        write_only=True,
    )
    date = serializers.DateField(
        required=True,
        write_only=True,
        error_messages={
            "blank": _("يرجى إدخال التاريخ"),
            "null": _("التاريخ لا يمكن أن يكون فارغًا"),
            "invalid": _("يرجى إدخال تاريخ صحيح"),
        },
    )
    payment_method = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            "invalid_choice": _("يرجى اختيار طريقة دفع صحيحة"),
            "blank": _("طريقة الدفع مطلوبة"),
        },
    )
    bank_account = serializers.PrimaryKeyRelatedField(
        queryset=BankAccount.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    receipt_number = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    class Meta:
        model = ProjectTransaction
        fields = '__all__'
        read_only_fields = ["financial_record"]

    @transaction.atomic
    def create(self, validated_data):
        transaction_type = validated_data.pop("transaction_type")
        if transaction_type == "income":
            transaction_type, __ = TransactionType.objects.get_or_create(name="إيرادات مشاريع",
                                                                         type=TransactionType.Type.INCOME,
                                                                         system_related=True)
        elif transaction_type == "expense":
            transaction_type, __ = TransactionType.objects.get_or_create(name="مصروفات مشاريع",
                                                                         type=TransactionType.Type.EXPENSE,
                                                                         system_related=True)

        financial_data = {
            "amount": validated_data.pop("amount"),
            "transaction_type": transaction_type,
            "date": validated_data.pop("date"),
            "payment_method": validated_data.pop("payment_method"),
            "bank_account": validated_data.pop("bank_account", None),
            "receipt_number": validated_data.pop("receipt_number", None),
            "notes": validated_data.pop("notes", None),
            "created_by": self.context["request"].user,
        }

        financial_record = FinancialRecord.objects.create(**financial_data)
        return ProjectTransaction.objects.create(
            financial_record=financial_record, **validated_data
        )
