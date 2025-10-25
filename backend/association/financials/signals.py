from django.apps import apps
from django.db.models.signals import post_migrate, post_save, post_delete, pre_save
from django.dispatch import receiver
from clients.models import RankChoices
from financials.models import FinancialRecord, TransactionType
from decimal import Decimal


def create_default_rank_fees(sender, **kwargs):
    RankFee = apps.get_model("financials", "RankFee")
    created_count = 0
    for rank, _ in RankChoices.choices:
        obj, created = RankFee.objects.get_or_create(
            rank=rank,
            defaults={"fee": 100.00},
        )
        if created:
            created_count += 1
    if created_count:
        print(f"✅ Created {created_count} missing RankFee records.")


post_migrate.connect(create_default_rank_fees)


def normalize_amount(amount: Decimal, transaction_type) -> Decimal:
    if transaction_type == TransactionType.Type.INCOME:
        return amount
    else:
        return -amount


@receiver(pre_save, sender=FinancialRecord)
def store_old_state(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_bank = None
        instance._old_amount = Decimal(0)
        return
    try:
        old = sender.objects.get(pk=instance.pk)
        instance._old_bank = old.bank_account
        instance._old_amount = old.amount
    except sender.DoesNotExist:
        instance._old_bank = None
        instance._old_amount = Decimal(0)


# update bank balance on create
@receiver(post_save, sender=FinancialRecord)
def update_balance_on_create(sender, instance: FinancialRecord, created, **kwargs):
    bank = instance.bank_account
    amount = Decimal(instance.amount)

    # handle create
    if created:
        if instance.payment_method == FinancialRecord.PaymentMethod.CASH:
            return

        if not bank:
            return

        bank.balance += normalize_amount(amount, instance.transaction_type.type)

    # handle update
    else:
        old_bank = getattr(instance, '_old_bank', None)
        old_amount = getattr(instance, '_old_amount', None)

        # same bank
        if old_bank == instance.bank_account:
            diff = amount - old_amount
            bank.balance += normalize_amount(diff, instance.transaction_type.type)

        # bank changed
        else:
            new_amount = normalize_amount(amount, instance.transaction_type.type)

            if bank and instance.payment_method != FinancialRecord.PaymentMethod.CASH:
                bank.balance += new_amount

            if old_bank:
                old_bank.balance -= new_amount
                old_bank.save(update_fields=["balance"])

    if bank:
        bank.save(update_fields=['balance'])


@receiver(post_delete, sender=FinancialRecord)
def delete_balance_on_create(sender, instance: FinancialRecord, **kwargs):
    bank = instance.bank_account
    if not bank:
        return

    amount = Decimal(instance.amount)

    bank.balance -= normalize_amount(amount, instance.transaction_type.type)

    bank.save(update_fields=['balance'])
