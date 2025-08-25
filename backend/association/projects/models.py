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
