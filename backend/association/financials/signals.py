from django.apps import apps
from django.db.models.signals import post_migrate
from clients.models import RankChoices


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
