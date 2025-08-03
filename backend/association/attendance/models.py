from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class Attendance(models.Model):
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        verbose_name=_("الموظف")
    )

    date = models.DateField(
        verbose_name=_("تاريخ الحضور"),
        error_messages={
            'invalid': _("يرجى إدخال تاريخ صحيح."),
            'null': _("يرجى تحديد التاريخ.")
        }
    )

    check_in = models.TimeField(
        verbose_name=_("وقت الحضور"),
        error_messages={
            'invalid': _("يرجى إدخال وقت صالح."),
            'null': _("يرجى إدخال وقت الحضور.")
        }
    )

    check_out = models.TimeField(
        null=True,
        blank=True,
        verbose_name=_("وقت الانصراف"),
        error_messages={
            'invalid': _("يرجى إدخال وقت صالح.")
        }
    )

    class Meta:
        verbose_name = _("تسجيل حضور")
        verbose_name_plural = _("تسجيلات الحضور")
        ordering = ['id']
        unique_together = ["date", "employee"]

    def __str__(self):
        return f"{self.employee} - {self.date.strftime('%Y-%m-%d')} {self.check_in.strftime('%H:%M')}"

    def clean(self):
        # Ensure check_out is not earlier than check_in
        if self.check_out and self.check_out < self.check_in:
            raise ValidationError({
                'check_out': _("وقت الانصراف لا يمكن أن يكون قبل وقت الحضور.")
            })


class Day(models.Model):
    class DayEnum(models.TextChoices):
        SATURDAY = "saturday", _("السبت")
        SUNDAY = "sunday", _("الأحد")
        MONDAY = "monday", _("الاثنين")
        TUESDAY = "tuesday", _("الثلاثاء")
        WEDNESDAY = "wednesday", _("الأربعاء")
        THURSDAY = "thursday", _("الخميس")
        FRIDAY = "friday", _("الجمعة")

    name = models.CharField(max_length=10, choices=DayEnum.choices, unique=True)

    def __str__(self):
        return self.get_name_display()

    class Meta:
        verbose_name = _("اليوم")
        verbose_name_plural = _("الأيام")
        ordering = ['id']


class AttendanceSettings(models.Model):
    name = models.CharField(_("الاسم"), max_length=100, blank=True, null=True)

    check_in = models.TimeField(_("وقت الحضور"))
    check_out = models.TimeField(_("وقت الانصراف"))
    grace_period = models.PositiveIntegerField(_("فترة السماحية"), default=15)

    working_days = models.ManyToManyField("Day", verbose_name=_("أيام العمل"))

    def __str__(self):
        return self.name or _("إعدادات الحضور الافتراضية")

    class Meta:
        verbose_name = _("إعدادات الحضور")
        verbose_name_plural = _("إعدادات الحضور")
