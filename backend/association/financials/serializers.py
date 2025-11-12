from dateutil.relativedelta import relativedelta
from django.db.models import Count, Q
from rest_framework import serializers
from django.conf import settings
from .models import BankAccount, TransactionType, FinancialRecord, Subscription, RankFee, Installment, Loan, Repayment
from rest_framework.validators import UniqueTogetherValidator
from django.utils.translation import gettext_lazy as _


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = '__all__'


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'


class RankFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RankFee
        fields = '__all__'


class FinancialRecordReadSerializer(serializers.ModelSerializer):
    transaction_type = TransactionTypeSerializer()
    project = serializers.SerializerMethodField()
    bank_account = BankAccountSerializer()
    created_at = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(source="created_by.name")

    class Meta:
        model = FinancialRecord
        fields = '__all__'

    def get_created_at(self, obj: FinancialRecord):
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime("%Y-%m-%d %I:%M%p")

    def get_project(self, obj: FinancialRecord):
        if getattr(obj, "project_transaction", None):
            return {"name": obj.project_transaction.project.name, "id": obj.project_transaction.project.id}


class FinancialRecordWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialRecord
        fields = '__all__'
        read_only_fields = ["created_by", ]

    def create(self, validated_data):
        user = self.context['request'].user
        return super(FinancialRecordWriteSerializer, self).create({**validated_data, "created_by": user})


class SubscriptionReadSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m")
    paid_at = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = Subscription
        fields = '__all__'


class SubscriptionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'

        validators = [
            UniqueTogetherValidator(
                queryset=Subscription.objects.all(),
                fields=["client", "date"],
                message=_("تم دفع اشتراك هذا الشهر بالفعل."),
            )
        ]

    def validate_date(self, value):
        return value.replace(day=1)


class InstallmentSerializer(serializers.ModelSerializer):
    due_date = serializers.DateField(format="%Y-%m")

    class Meta:
        model = Installment
        fields = '__all__'


class LoanSerializer(serializers.ModelSerializer):
    repayments_count = serializers.IntegerField(write_only=True, required=True)
    payment_date = serializers.DateField(write_only=True, required=True)
    client_data = serializers.SerializerMethodField(read_only=True)
    repayments = serializers.SerializerMethodField(read_only=True)
    is_completed = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Loan
        fields = '__all__'

    def create(self, validated_data):
        user = self.context['request'].user

        repayments_count = validated_data.pop("repayments_count")
        payment_date = validated_data.pop("payment_date")

        # create the loan instance
        loan = super().create({**validated_data})

        # Calculate repayment amount
        repayment_amount = loan.amount / repayments_count
        base_date = payment_date.replace(day=1)

        for i in range(repayments_count):
            due_date = base_date + relativedelta(months=i)
            Repayment.objects.create(
                loan=loan,
                repayment_number=i + 1,
                amount=repayment_amount,
                due_date=due_date,
            )

        return loan

    def get_repayments(self, obj: Loan):
        return obj.repayments.aggregate(total=Count("id"),
                                        unpaid=Count("id", filter=Q(status=Repayment.Status.UNPAID)),
                                        paid=Count("id", filter=Q(status=Repayment.Status.PAID)))

    def get_is_completed(self, obj: Loan):
        return obj.is_completed

    def get_client_data(self, obj: Loan):
        return {"id": obj.client.id,
                "name": obj.client.name,
                "membership_number": obj.client.membership_number,
                "rank": obj.client.rank,
                "is_active": obj.client.is_active,
                }


class RepaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repayment
        fields = '__all__'
