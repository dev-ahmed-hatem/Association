from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from rest_framework import serializers

from .models import Client, WorkEntity
from financials.models import RankFee, Installment, Repayment
from dateutil.relativedelta import relativedelta


class WorkEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEntity
        fields = '__all__'


class ClientSelectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name']


class ClientListSerializer(serializers.ModelSerializer):
    seniority = serializers.SerializerMethodField()
    work_entity = serializers.StringRelatedField(source="work_entity.name")

    # Dues
    dues = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ["id", "name", "membership_number", "rank", "seniority", "work_entity", "is_active", "dues",
                  "subscription_date"]

    def get_seniority(self, obj: Client):
        return obj.get_seniority()

    def get_dues(self, obj: Client):
        due_months, paid_subscriptions = obj.get_subscriptions_status()
        unpaid_installments = obj.installments.filter(status=Installment.Status.UNPAID).count()
        unpaid_repayments = Repayment.objects.filter(status=Repayment.Status.UNPAID, loan__client=obj).count()
        return {"unpaid_subscriptions": max(due_months - paid_subscriptions, 0),
                "unpaid_installments": unpaid_installments,
                "unpaid_repayments": unpaid_repayments
                }


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

    def get_unpaid_subscriptions(self, obj: Client):
        return obj.get_subscriptions_status()


class ClientWriteSerializer(serializers.ModelSerializer):
    # payment_method = serializers.ChoiceField(
    #     choices=FinancialRecord.PaymentMethod.choices,
    #     required=False,
    #     error_messages={"required": "يرجى اختيار نظام الدفع"},
    #     write_only=True
    # )
    # Only required if payment_method == "دفع بنكي"
    # bank_account = serializers.IntegerField(
    #     required=False, allow_null=True,
    #     error_messages={"invalid": "يرجى إدخال بنك صالح"},
    #     write_only=True
    # )
    # receipt_number = serializers.CharField(
    #     required=False, allow_blank=True,
    #     error_messages={"blank": "يرجى إدخال رقم الإيصال"},
    #     write_only=True
    # )
    installments_count = serializers.IntegerField(
        required=False, allow_null=True,
        min_value=1,
        error_messages={
            "invalid": "يرجى إدخال عدد صحيح",
            "min_value": "عدد الأقساط يجب أن يكون 1 على الأقل",
        },
        write_only=True
    )
    # payment_date = serializers.DateField(
    #     required=True,
    #     format="%Y-%m-%d",
    #     input_formats=["%Y-%m-%d"],
    #     error_messages={
    #         "required": "يرجى إدخال تاريخ الدفع",
    #         "invalid": "يرجى إدخال تاريخ صالح بالصيغة YYYY-MM-DD",
    #     },
    #     write_only=True
    # )
    payment_start_date = serializers.DateField(
        required=False,
        allow_null=True,
        format="%Y-%m-%d",
        input_formats=["%Y-%m-%d"],
        error_messages={
            "required": "يرجى إدخال تاريخ الدفع",
            "invalid": "يرجى إدخال تاريخ صالح بالصيغة YYYY-MM-DD",
        },
        write_only=True
    )
    # payment_notes = serializers.CharField(
    #     required=False,
    #     allow_blank=True,
    #     allow_null=True,
    #     write_only=True
    # )
    prepaid = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        error_messages={
            "invalid": "يرجى إدخال قيمة صالحة",
        },
    )

    def validate(self, data):
        """
        Custom validation to enforce frontend logic:
        - bank fields required only if method is 'إيصال بنكي'
        - paid_amount <= subscription_fee
        - installments_count required if there is remaining amount
        """
        is_create = self.instance is None

        subscription_fee = data.get("subscription_fee", 0)
        prepaid = data.get("prepaid", 0)
        remaining = subscription_fee - prepaid

        if is_create and subscription_fee > 0:
            # if data["payment_method"] in ["إيداع بنكي", "تحويل بنكي", "شيك"]:
            #     if not data.get("bank_account"):
            #         raise serializers.ValidationError({"bank_account": "يرجى إدخال البنك"})
            #     if not data.get("receipt_number"):
            #         raise serializers.ValidationError({"receipt_number": "يرجى إدخال رقم الإيصال"})

            if prepaid > subscription_fee:
                raise serializers.ValidationError({"prepaid": "المبلغ المدفوع لا يمكن أن يتجاوز رسوم الاشتراك"})

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
        prepaid = validated_data.get("prepaid", None)
        installments_count = validated_data.pop("installments_count", None)
        payment_start_date = validated_data.pop("payment_start_date", None)
        # payment_method = validated_data.pop("payment_method", None)
        # bank_account = validated_data.pop("bank_account", None)
        # receipt_number = validated_data.pop("receipt_number", None)
        # payment_date = validated_data.pop("payment_date", None)
        # payment_notes = validated_data.pop("payment_notes", None)

        # create initial client instance
        client = super().create({**validated_data, "created_by": user})

        if subscription_fee > 0 and prepaid < subscription_fee:
            remaining = subscription_fee - prepaid
            installment_amount = remaining / installments_count
            payment_start_date = payment_start_date.replace(day=1)

            for i in range(installments_count):
                due_date = payment_start_date + relativedelta(months=i)
                Installment.objects.create(
                    amount=installment_amount,
                    client=client,
                    installment_number=i + 1,
                    due_date=due_date,
                )

        return client
