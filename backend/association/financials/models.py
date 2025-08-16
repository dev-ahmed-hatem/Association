from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class BankAccount(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_("اسم الحساب البنكي"),
        error_messages={
            "unique": _("اسم الحساب البنكي موجود بالفعل"),
            "blank": _("يرجى إدخال اسم الحساب البنكي"),
            "null": _("اسم الحساب البنكي لا يمكن أن يكون فارغًا"),
        },
    )

    class Meta:
        verbose_name = _("حساب بنكي")
        verbose_name_plural = _("الحسابات البنكية")

    def __str__(self):
        return self.name


class TransactionType(models.Model):
    class Type(models.TextChoices):
        INCOME = "إيراد", _("إيراد")
        EXPENSE = "مصروف", _("مصروف")

    name = models.CharField(
        max_length=255,
        verbose_name=_("اسم نوع المعاملة"),
        error_messages={
            "blank": _("يرجى إدخال اسم نوع المعاملة"),
            "null": _("اسم نوع المعاملة لا يمكن أن يكون فارغًا"),
        },
    )
    type = models.CharField(
        max_length=10,
        choices=Type.choices,
        verbose_name=_("النوع"),
        error_messages={
            "invalid_choice": _("يرجى اختيار نوع صحيح (إيراد أو مصروف)"),
            "blank": _("يرجى تحديد النوع"),
        },
    )

    class Meta:
        verbose_name = _("نوع معاملة")
        verbose_name_plural = _("أنواع المعاملات")
        unique_together = ("name", "type")
        ordering = ["type", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class FinancialRecord(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = "نقدي", _("نقدي")
        BANK_RECEIPT = "إيصال بنكي", _("إيصال بنكي")

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("المبلغ"),
        error_messages={
            "blank": _("يرجى إدخال المبلغ"),
            "null": _("المبلغ لا يمكن أن يكون فارغًا"),
            "invalid": _("يرجى إدخال قيمة رقمية صحيحة"),
        },
    )
    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.RESTRICT,
        verbose_name=_("نوع المعاملة"),
        error_messages={
            "null": _("نوع المعاملة مطلوب"),
            "invalid": _("يرجى اختيار نوع معاملة صحيح"),
        },
    )
    date = models.DateField(
        verbose_name=_("التاريخ"),
        error_messages={
            "blank": _("يرجى إدخال التاريخ"),
            "null": _("التاريخ لا يمكن أن يكون فارغًا"),
            "invalid": _("يرجى إدخال تاريخ صحيح"),
        },
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        verbose_name=_("طريقة الدفع"),
        error_messages={
            "invalid_choice": _("يرجى اختيار طريقة دفع صحيحة"),
            "blank": _("طريقة الدفع مطلوبة"),
        },
    )
    bank_account = models.ForeignKey(
        BankAccount,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name=_("الحساب البنكي"),
    )
    receipt_number = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("رقم الإيصال"),
    )
    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("ملاحظات"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("تاريخ الإنشاء"),
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("تم الإنشاء بواسطة"),
    )

    class Meta:
        verbose_name = _("سجل مالي")
        verbose_name_plural = _("السجلات المالية")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.amount} - {self.transaction_type}"

    def clean(self):
        if self.payment_method == self.PaymentMethod.CASH:
            if self.bank_account:
                raise ValidationError({"bank_account": _("لا يمكن اختيار حساب بنكي عند الدفع نقدًا")})
            if self.receipt_number:
                raise ValidationError({"receipt_number": _("لا يمكن إدخال رقم إيصال عند الدفع نقدًا")})

        if self.payment_method == self.PaymentMethod.BANK_RECEIPT:
            if not self.bank_account:
                raise ValidationError({"bank_account": _("يرجى اختيار الحساب البنكي عند الدفع بواسطة إيصال")})
            if not self.receipt_number:
                raise ValidationError({"receipt_number": _("يرجى إدخال رقم الإيصال عند الدفع بواسطة إيصال")})
