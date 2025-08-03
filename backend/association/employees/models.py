from django.db import models
from association.utils import calculate_age
from users.models import User
from django.utils.translation import gettext_lazy as _

MARITAL_STATUS_CHOICES = [
    ("single", _("أعزب")),
    ("married", _("متزوج")),
    ("divorced", _("مطلق")),
    ("widowed", _("أرمل")),
]


class Department(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = _("القسم")
        verbose_name_plural = _("الأقسام")

    def __str__(self):
        return self.name


class Employee(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("الاسم"))

    department = models.ForeignKey(
        "Department",
        on_delete=models.CASCADE,
        verbose_name=_("القسم")
    )

    gender = models.CharField(
        max_length=6,
        choices=(("male", _("ذكر")), ("female", _("أنثى"))),
        verbose_name=_("الجنس")
    )

    email = models.EmailField(
        max_length=100,
        unique=True,
        verbose_name=_("البريد الإلكتروني"),
        error_messages={
            "unique": _("هذا البريد الإلكتروني مستخدم من قبل."),
        }
    )

    phone = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("رقم الهاتف"),
        error_messages={
            "unique": _("رقم الهاتف مستخدم من قبل."),
        }
    )

    employee_id = models.CharField(
        max_length=10,
        unique=True,
        verbose_name=_("رقم الموظف"),
        error_messages={
            "unique": _("رقم الموظف مستخدم من قبل."),
        }
    )

    address = models.CharField(max_length=100, verbose_name=_("العنوان"))

    birth_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ الميلاد"))

    age = models.IntegerField(null=True, blank=True, verbose_name=_("العمر"))

    national_id = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("الرقم القومي"),
        error_messages={
            "unique": _("الرقم القومي مستخدم من قبل."),
        }
    )

    marital_status = models.CharField(
        max_length=8,
        choices=MARITAL_STATUS_CHOICES,
        verbose_name=_("الحالة الاجتماعية")
    )

    position = models.CharField(max_length=100, verbose_name=_("الوظيفة"))

    hire_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ التعيين"))

    cv = models.FileField(upload_to='employees/cv', null=True, blank=True, verbose_name=_("السيرة الذاتية"))

    image = models.ImageField(upload_to='employees/images', null=True, blank=True, verbose_name=_("الصورة"))

    mode = models.CharField(
        max_length=100,
        choices=(("remote", "عن بُعد"), ("on-site", "من المقر"), ("hybrid", "هجين")),
        verbose_name=_("وضع العمل")
    )

    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("أُضيف بواسطة"))

    class Meta:
        verbose_name = _("الموظف")
        verbose_name_plural = _("الموظفين")

    def __str__(self):
        return f"{self.id} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.age:
            self.age = calculate_age(self.birth_date)
        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        if self.cv:
            self.cv.delete()
        if self.image:
            self.image.delete()
        return super().delete()
