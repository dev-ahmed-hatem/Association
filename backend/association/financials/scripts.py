from datetime import date

from dateutil.relativedelta import relativedelta

from clients.models import Client
from users.models import User
from .models import *


def change_bank_receipt():
    incomes = FinancialRecord.objects.filter(transaction_type__type=TransactionType.Type.INCOME,
                                             payment_method="إيصال بنكي")
    expenses = FinancialRecord.objects.filter(transaction_type__type=TransactionType.Type.EXPENSE,
                                              payment_method="إيصال بنكي")

    for i in incomes:
        i.payment_method = FinancialRecord.PaymentMethod.BANK_DEPOSIT
        i.save()

    for i in expenses:
        i.payment_method = FinancialRecord.PaymentMethod.BANK_EXPENSE
        i.save()


def delete_subscription_fees():
    """
    delete all subscription fees with amount 1
    """

    clients = Client.objects.filter(prepaid__amount=1, prepaid__transaction_type__name="رسوم عضوية")
    count = 0
    for client in clients:
        client.subscription_fee = 0
        client.save(update_fields=['subscription_fee'])
        client.prepaid.delete()
        count += 1
    print("Deleted {} subscription fees".format(count))


def record_subscriptions():
    clients = Client.objects.all()
    transaction_type = TransactionType.objects.get(name="رسوم اشتراكات")
    end_date = date(2025, 7, 1)
    user = User.objects.get(id=2)

    for client in clients:
        payment_date = (client.subscription_date + relativedelta(months=1)).replace(day=1)
        while payment_date <= end_date:
            financial_record = FinancialRecord.objects.create(
                amount=0,
                transaction_type=transaction_type,
                date=payment_date,
                payment_method="اشتراك شهري",
                created_by=user,
            )
            subscription = Subscription.objects.create(
                financial_record=financial_record,
                client=client,
                amount=0,
                date=payment_date,
                paid_at=payment_date,
            )
            payment_date = payment_date + relativedelta(months=1)

