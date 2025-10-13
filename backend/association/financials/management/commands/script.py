from django.core.management.base import BaseCommand

from financials.scripts import delete_manually_added_records


class Command(BaseCommand):
    def handle(self, *args, **options):
        delete_manually_added_records()
