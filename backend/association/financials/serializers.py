from rest_framework import serializers
from django.conf import settings
from .models import BankAccount, TransactionType, FinancialRecord, Subscription, RankFee, Installment
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
    transaction_type_name = serializers.SerializerMethodField()
    bank_account = BankAccountSerializer()
    created_at = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(source="created_by.name")

    class Meta:
        model = FinancialRecord
        fields = '__all__'

    def get_created_at(self, obj: FinancialRecord):
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime("%Y-%m-%d %I:%M%p")

    def get_transaction_type_name(self, obj: FinancialRecord):
        if getattr(obj, "project_transaction", None):
            return obj.project_transaction.project.name
        if getattr(obj, "subscription", None):
            return obj.subscription.client.name
        if getattr(obj, "installment", None):
            return obj.installment.client.name


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
        read_only_fields = ["financial_record", ]

        validators = [
            UniqueTogetherValidator(
                queryset=Subscription.objects.all(),
                fields=["client", "date"],
                message=_("تم دفع اشتراك هذا الشهر بالفعل."),
            )
        ]

    def validate_date(self, value):
        return value.replace(day=1)

    def create(self, validated_data):
        transaction_type, _ = TransactionType.objects.get_or_create(name="رسوم اشتراكات",
                                                                    type=TransactionType.Type.INCOME,
                                                                    system_related=True)
        financial_record = FinancialRecord.objects.create(
            amount=validated_data["amount"],
            transaction_type=transaction_type,
            date=validated_data["paid_at"],
            payment_method="اشتراك شهري",
            notes=validated_data.get("notes"),
            created_by=self.context["request"].user,
        )

        return super().create({**validated_data, "financial_record": financial_record})


class InstallmentSerializer(serializers.ModelSerializer):
    due_date = serializers.DateField(format="%Y-%m")
    notes = serializers.StringRelatedField(source="financial_record.notes", read_only=True)

    class Meta:
        model = Installment
        fields = '__all__'
