from django.db import models
from django.utils.translation import gettext_lazy as _

from users.models import User
from datetime import date


class WorkEntity(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_("جهة العمل"),
        error_messages={"blank": _("يرجى إدخال جهة العمل")}
    )

    class Meta:
        verbose_name = _("جهة العمل")
        verbose_name_plural = _("جهات العمل")

    def __str__(self):
        return self.name


class MembershipType(models.TextChoices):
    FOUNDER = 'مؤسس', _('مؤسس')
    ACTIVE = 'عامل', _('عامل')
    JOINED = 'منضم', _('منضم')


class MaritalStatus(models.TextChoices):
    SINGLE = 'أعزب', _('أعزب')
    MARRIED = 'متزوج', _('متزوج')
    DIVORCED = 'مطلق', _('مطلق')
    WIDOWED = 'أرمل', _('أرمل')


class RankChoices(models.TextChoices):
    MULAZIM = "ملازم", _("ملازم")
    FIRST_MULAZIM = "ملازم أول", _("ملازم أول")
    NAQIB = "نقيب", _("نقيب")
    RAEED = "رائد", _("رائد")
    MUQADDIM = "مقدم", _("مقدم")
    AQEED = "عقيد", _("عقيد")
    AMEED = "عميد", _("عميد")
    LIWA = "لواء", _("لواء")
    ASSISTANT_MINISTER = "لواء مساعد وزير", _("لواء مساعد وزير")


class Client(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_("الاسم"),
        error_messages={"blank": _("يرجى إدخال الاسم")}
    )
    rank = models.CharField(
        max_length=16,
        verbose_name=_("الرتبة"),
        choices=RankChoices.choices,
        error_messages={"blank": _("يرجى إدخال الرتبة")}
    )
    national_id = models.CharField(
        max_length=14,
        verbose_name=_("الرقم القومي"),
        unique=True,
        error_messages={
            "blank": _("يرجى إدخال الرقم القومي"),
            "unique": _("الرقم القومي مستخدم من قبل")
        }
    )
    birth_date = models.DateField(
        verbose_name=_("تاريخ الميلاد"),
        error_messages={"invalid": _("يرجى إدخال تاريخ صالح")}
    )
    hire_date = models.DateField(
        verbose_name=_("تاريخ التعيين"),
        error_messages={"invalid": _("يرجى إدخال تاريخ صحيح")}
    )
    phone_number = models.CharField(
        max_length=15,
        unique=True,
        verbose_name=_("رقم الهاتف"),
        error_messages={"blank": _("يرجى إدخال رقم الهاتف"),
                        "unique": _("رقم الهاتف مستخدم من قبل")}
    )
    membership_type = models.CharField(
        max_length=10,
        choices=MembershipType.choices,
        default=MembershipType.JOINED,
        verbose_name=_("نوع العضوية")
    )
    work_entity = models.ForeignKey(
        WorkEntity,
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        verbose_name=_("جهة العمل")
    )
    membership_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("رقم العضوية"),
        error_messages={
            "blank": _("يرجى إدخال رقم العضوية"),
            "unique": _("رقم العضوية مستخدم مسبقًا")
        }
    )
    subscription_date = models.DateField(
        verbose_name=_("تاريخ الاشتراك"),
        error_messages={"invalid": _("يرجى إدخال تاريخ صحيح")}
    )
    marital_status = models.CharField(
        max_length=10,
        choices=MaritalStatus.choices,
        verbose_name=_("الحالة الاجتماعية")
    )
    graduation_year = models.PositiveIntegerField(
        verbose_name=_("سنة التخرج"),
        error_messages={"invalid": _("يرجى إدخال سنة التخرج")}
    )
    class_rank = models.CharField(
        max_length=50,
        verbose_name=_("الترتيب على الدفعة"),
        error_messages={"blank": _("يرجى إدخال الترتيب")}
    )
    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("ملاحظات"),
    )

    # joining financial fields
    financial_record = models.ForeignKey(
        "financials.FinancialRecord",
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        verbose_name=_("المدفوع مقدما")
    )

    subscription_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("رسوم الاشتراك"),
        help_text=_("القيمة الإجمالية لرسوم اشتراك العضو"),
        error_messages={
            "invalid": _("يرجى إدخال قيمة مالية صحيحة"),
        }
    )

    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("المبلغ المدفوع"),
        error_messages={
            "invalid": _("يرجى إدخال قيمة مالية صحيحة"),
        }
    )

    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("تاريخ الإنشاء")
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_("تم الإنشاء بواسطة")
    )

    class Meta:
        verbose_name = _("عميل")
        verbose_name_plural = _("العملاء")

    @property
    def age(self):
        """Return age in whole years, rounded up if more than exact year difference."""
        today = date.today()
        years = today.year - self.birth_date.year
        months = today.month - self.birth_date.month
        days = today.day - self.birth_date.day

        if months > 6 or (months == 6 and days > 1):
            return years + 1
        return years

    def get_seniority(self):
        return f"{self.graduation_year}/{self.class_rank}"

    def __str__(self):
        return f"{self.get_rank_display()} {self.name} - {self.membership_number}"
