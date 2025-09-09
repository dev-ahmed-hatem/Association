from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Project(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "قيد التنفيذ", _("قيد التنفيذ")
        COMPLETED = "منتهي", _("منتهي")

    name = models.CharField(
        max_length=255,
        verbose_name=_("اسم المشروع"),
        help_text=_("أدخل اسم المشروع")
    )
    start_date = models.DateField(
        verbose_name=_("تاريخ البداية"),
        help_text=_("تاريخ بداية المشروع")
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
        verbose_name=_("الحالة"),
        help_text=_("حالة المشروع")
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
        verbose_name=_("أنشئ بواسطة")
    )

    class Meta:
        verbose_name = _("مشروع")
        verbose_name_plural = _("المشاريع")

    def __str__(self):
        return self.name


class ProjectTransaction(models.Model):
    statement = models.CharField(
        max_length=255,
        verbose_name=_("البيان"),
        error_messages={
            "blank": _("يجب إدخال البيان"),
            "null": _("يجب إدخال البيان"),
        },
    )

    financial_record = models.OneToOneField(
        "financials.FinancialRecord",
        on_delete=models.CASCADE,
        related_name="project_transaction",
        verbose_name=_("المعاملة المالية"),
        error_messages={
            "null": _("يجب ربط العملية بمعاملة مالية"),
            "blank": _("يجب ربط العملية بمعاملة مالية"),
        },
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.RESTRICT,
        related_name="transactions",
        verbose_name=_("المشروع"),
        error_messages={
            "null": _("يجب ربط العملية بمشروع"),
            "blank": _("يجب ربط العملية بمشروع"),
        },
    )

    class Meta:
        verbose_name = _("عملية مشروع")
        verbose_name_plural = _("عمليات المشاريع")

    def __str__(self):
        return f"{self.statement} - {self.project.name}"

    def delete(self, *args, **kwargs):
        if self.financial_record:
            self.financial_record.delete()
        super().delete(*args, **kwargs)
