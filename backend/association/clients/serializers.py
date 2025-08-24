from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Client, WorkEntity
from financials.models import RankFee, TransactionType, FinancialRecord, Installment, BankAccount
from datetime import datetime
from dateutil.relativedelta import relativedelta


class WorkEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEntity
        fields = '__all__'


class ClientListSerializer(serializers.ModelSerializer):
    seniority = serializers.SerializerMethodField()
    work_entity = serializers.StringRelatedField(source="work_entity.name")

    class Meta:
        model = Client
        fields = ["id", "name", "membership_number", "rank", "seniority", "work_entity", "is_active"]

    def get_seniority(self, obj: Client):
        return obj.get_seniority()


class ClientReadSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(source="created_by.name")
    seniority = serializers.SerializerMethodField()
    work_entity = serializers.StringRelatedField(source="work_entity.name")
    age = serializers.SerializerMethodField()
    rank_fee = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = "__all__"

    def get_age(self, obj: Client):
        return obj.age

    def get_created_at(self, obj: Client):
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime("%Y-%m-%d %I:%M%p")

    def get_seniority(self, obj: Client):
        return obj.get_seniority()

    def get_rank_fee(self, obj: Client):
        return RankFee.objects.get(rank=obj.rank).fee


class ClientWriteSerializer(serializers.ModelSerializer):
    payment_method = serializers.ChoiceField(
        choices=[("نقدي", "نقدي"), ("إيصال بنكي", "إيصال بنكي")],
        required=True,
        error_messages={"required": "يرجى اختيار نظام الدفع"},
        write_only=True
    )
    # Only required if payment_method == "إيصال بنكي"
    bank_account = serializers.IntegerField(
        required=False, allow_null=True,
        error_messages={"invalid": "يرجى إدخال بنك صالح"},
        write_only=True
    )
    receipt_number = serializers.CharField(
        required=False, allow_blank=True,
        error_messages={"blank": "يرجى إدخال رقم الإيصال"},
        write_only=True
    )
    installments_count = serializers.IntegerField(
        required=False, allow_null=True,
        min_value=1,
        error_messages={
            "invalid": "يرجى إدخال عدد صحيح",
            "min_value": "عدد الأقساط يجب أن يكون 1 على الأقل",
        },
        write_only=True
    )
    payment_date = serializers.DateField(
        required=True,
        format="%Y-%m-%d",
        input_formats=["%Y-%m-%d"],
        error_messages={
            "required": "يرجى إدخال تاريخ الدفع",
            "invalid": "يرجى إدخال تاريخ صالح بالصيغة YYYY-MM-DD",
        },
        write_only=True
    )
    payment_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        write_only=True
    )

    def validate(self, data):
        """
        Custom validation to enforce frontend logic:
        - bank fields required only if method is 'إيصال بنكي'
        - paid_amount <= subscription_fee
        - installments_count required if there is remaining amount
        """
        subscription_fee = data.get("subscription_fee", 0)
        paid_amount = data.get("paid_amount", 0)
        remaining = subscription_fee - paid_amount

        if data["payment_method"] == "إيصال بنكي":
            if not data.get("bank_account"):
                raise serializers.ValidationError({"bank_account": "يرجى إدخال البنك"})
            if not data.get("receipt_number"):
                raise serializers.ValidationError({"receipt_number": "يرجى إدخال رقم الإيصال"})

        if paid_amount > subscription_fee:
            raise serializers.ValidationError({"paid_amount": "المبلغ المدفوع لا يمكن أن يتجاوز رسوم الاشتراك"})

        if remaining > 0 and not data.get("installments_count"):
            raise serializers.ValidationError({"installments_count": "يرجى إدخال عدد الأقساط للمبلغ المتبقي"})

        return data

    class Meta:
        model = Client
        fields = "__all__"
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Client.objects.all(),
                fields=('class_rank', 'graduation_year'),
                message=_("الترتيب على الدفعة وسنة التخرج مسجلان لعضو اخر.")
            )
        ]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user

        subscription_fee = validated_data.get("subscription_fee")
        paid_amount = validated_data.get("paid_amount")
        installments_count = validated_data.pop("installments_count", None)
        payment_method = validated_data.pop("payment_method")
        bank_account = validated_data.pop("bank_account", None)
        receipt_number = validated_data.pop("receipt_number", None)
        payment_date = validated_data.pop("payment_date", None)
        payment_notes = validated_data.pop("payment_notes", None)

        # create initial client instance
        client = super().create({**validated_data, "created_by": user})

        if subscription_fee == paid_amount:
            transaction_name = "رسوم عضوية"
            transaction_type, __ = TransactionType.objects.get_or_create(name=transaction_name,
                                                                         type=TransactionType.Type.INCOME,
                                                                         system_related=True)
        else:
            transaction_name = "مقدم عضوية"
            transaction_type, __ = TransactionType.objects.get_or_create(name=transaction_name,
                                                                         type=TransactionType.Type.INCOME,
                                                                         system_related=True)
            remaining = subscription_fee - paid_amount
            installment_amount = remaining / installments_count
            base_date = payment_date.replace(day=1)

            for i in range(installments_count):
                due_date = base_date + relativedelta(months=i + 1)
                Installment.objects.create(
                    amount=installment_amount,
                    client=client,
                    installment_number=i + 1,
                    due_date=due_date,
                )

        bank_account_obj = None
        if payment_method == "إيصال بنكي":
            if not bank_account:
                raise ValidationError({"bank_account": [_("يجب اختيار حساب بنكي عند الدفع بالإيصال")]})
            try:
                bank_account_obj = BankAccount.objects.get(id=bank_account)
            except BankAccount.DoesNotExist:
                raise ValidationError({"bank_account": [_("الحساب البنكي غير موجود")]})

        FinancialRecord.objects.create(
            amount=paid_amount,
            transaction_type=transaction_type,
            date=payment_date,
            payment_method=payment_method,
            bank_account=bank_account_obj,
            receipt_number=receipt_number,
            notes=payment_notes,
            created_by=user,
        )

        return client
