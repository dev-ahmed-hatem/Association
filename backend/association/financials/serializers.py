from rest_framework import serializers
from .models import BankAccount, TransactionType, FinancialRecord


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = '__all__'


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'


class FinancialRecordReadSerializer(serializers.ModelSerializer):
    transaction_type = TransactionTypeSerializer()
    bank_account = BankAccountSerializer()

    class Meta:
        model = FinancialRecord
        fields = '__all__'


class FinancialRecordWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialRecord
        fields = '__all__'
        read_only_fields = ["created_by", ]

    def create(self, validated_data):
        user = self.context['request'].user
        return super(FinancialRecordWriteSerializer, self).create({**validated_data, "created_by": user})
