import datetime

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User

PROJECT_STATUS_CHOICES = [
    ('ongoing', _('قيد التنفيذ')),
    ('completed', _('مكتمل')),
    ('pending-approval', _('قيد الموافقة')),
    ('paused', _('متوقف')),
]

TASK_STATUS_CHOICES = [
    ('completed', _('مكتمل')),
    ('incomplete', _('غير مكتمل')),
]

PRIORITY_CHOICES = [
    ('low', _('منخفض')),
    ('medium', _('متوسط')),
    ('high', _('مرتفع')),
]


class AbstractBaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("أنشئ بواسطة"),
    )

    class Meta:
        abstract = True


class Project(AbstractBaseModel):
    name = models.CharField(
        max_length=255,
        verbose_name=_("اسم المشروع"),
        error_messages={
            'blank': _("يرجى إدخال اسم المشروع."),
            'max_length': _("اسم المشروع طويل جدًا."),
        },
    )
    status = models.CharField(
        max_length=20,
        choices=PROJECT_STATUS_CHOICES,
        default='pending-approval',
        verbose_name=_("الحالة"),
        db_index=True,
    )
    start_date = models.DateField(
        verbose_name=_("تاريخ البدء"),
        error_messages={'invalid': _("يرجى إدخال تاريخ صالح.")},
    )
    end_date = models.DateField(
        verbose_name=_("تاريخ الانتهاء"),
        null=True,
        blank=True,
        error_messages={'invalid': _("يرجى إدخال تاريخ صالح.")},
    )
    progress_started = models.DateTimeField(
        verbose_name=_("تاريخ بدء التنفيذ"),
        null=True,
        blank=True,
    )
    supervisors = models.ManyToManyField(
        'employees.Employee',
        related_name='supervised_projects',
        verbose_name=_("المشرفون"),
        blank=True,
    )
    client = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("العميل"),
    )
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("الميزانية"),
        error_messages={
            'invalid': _("يرجى إدخال رقم صحيح."),
        },
    )
    description = models.TextField(
        verbose_name=_("الوصف"),
        blank=True,
        null=True,
    )

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError(_("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء."))

    class Meta:
        verbose_name = _("مشروع")
        verbose_name_plural = _("المشاريع")

    def remaining_tasks(self):
        return Task.objects.filter(
            project=self, status="incomplete"
        )

    def __str__(self):
        return self.name


class Task(AbstractBaseModel):
    title = models.CharField(
        max_length=255,
        verbose_name=_("عنوان المهمة"),
        error_messages={
            'blank': _("يرجى إدخال عنوان المهمة."),
            'max_length': _("عنوان المهمة طويل جدًا."),
        },
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("الوصف"),
    )
    departments = models.ManyToManyField(
        'employees.Department',
        verbose_name=_("الأقسام"),
    )
    status = models.CharField(
        max_length=20,
        choices=TASK_STATUS_CHOICES,
        default="incomplete",
        verbose_name=_("الحالة"),
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="low",
        verbose_name=_("الأولوية"),
        db_index=True
    )
    due_date = models.DateField(
        verbose_name=_("تاريخ الاستحقاق"),
        error_messages={
            'invalid': _("يرجى إدخال تاريخ صالح."),
        },
    )
    assigned_to = models.ManyToManyField(
        'employees.Employee',
        related_name="tasks",
        verbose_name=_("الموظفين المكلّف"),
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tasks",
        verbose_name=_("المشروع"),
    )

    class Meta:
        verbose_name = _("مهمة")
        verbose_name_plural = _("المهام")

    def delete(self, using=None, keep_parents=False):
        project = self.project
        super(Task, self).delete()
        if not project.remaining_tasks().exists():
            project.status = "completed"
            project.save()

    def __str__(self):
        return self.title
