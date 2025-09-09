from .models import *


def change_bank_receipt():
    incomes = FinancialRecord.objects.filter(transaction_type__type=TransactionType.Type.INCOME, payment_method="إيصال بنكي")
    expenses = FinancialRecord.objects.filter(transaction_type__type=TransactionType.Type.EXPENSE,
                                              payment_method="إيصال بنكي")

    for i in incomes:
        i.payment_method = FinancialRecord.PaymentMethod.BANK_DEPOSIT
        i.save()

    for i in expenses:
        i.payment_method = FinancialRecord.PaymentMethod.BANK_EXPENSE
        i.save()
