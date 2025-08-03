from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from datetime import time

from .models import Day, AttendanceSettings


@receiver(post_migrate)
def create_default_data(sender, **kwargs):
    # Only run for app
    if sender.name != 'attendance':
        return

    for key, label in Day.DayEnum.choices:
        Day.objects.get_or_create(name=key)

    # Create default AttendanceSettings if not exists
    if not AttendanceSettings.objects.exists():
        attendance = AttendanceSettings.objects.create(
            name=_("الجدول الافتراضي"),
            check_in=time(10, 0),
            check_out=time(17, 0),
            grace_period=15,
        )
        working_days = Day.objects.filter(name__in=[
            "sunday", "monday", "tuesday", "wednesday"
        ])
        attendance.working_days.set(working_days)
