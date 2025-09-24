from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from clients.models import RankChoices


class RankFee(models.Model):
    rank = models.CharField(
        max_length=50,
        choices=RankChoices.choices,
        unique=True,
        verbose_name=_("الرتبة"),
        error_messages={
            "unique": _("هذه الرتبة مسجلة بالفعل."),
            "blank": _("الرجاء إدخال اسم الرتبة."),
        },
    )
    fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=100.00,
        verbose_name=_("الرسوم الشهرية"),
        error_messages={
            "invalid": _("الرجاء إدخال قيمة صحيحة."),
        },
    )

    class Meta:
        verbose_name = _("رسوم الرتبة")
        verbose_name_plural = _("رسوم الرتب")
        ordering = ["id"]

    def __str__(self):
        self.fee_ = f"{self.rank} - {self.fee}"
        return self.fee_


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
    system_related = models.BooleanField(
        default=False,
        verbose_name=_("خاص بالنظام"),
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
        BANK_DEPOSIT = "إيداع بنكي", _("إيداع بنكي")
        BANK_EXPENSE = "مصروف بنكي", _("مصروف بنكي")
        CHEQUE = "شيك", _("شيك")
        BANK_TRANSFER = "تحويل بنكي", _("تحويل بنكي")

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


class Subscription(models.Model):
    financial_record = models.OneToOneField(
        FinancialRecord,
        on_delete=models.CASCADE,
        related_name="subscription",
        verbose_name=_("المعاملة المالية"),
        error_messages={
            "null": _("يجب ربط الاشتراك بمعاملة مالية"),
            "blank": _("يجب تحديد المعاملة المالية"),
        },
    )

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.RESTRICT,
        related_name="subscriptions",
        verbose_name=_("العضو"),
        error_messages={
            "null": _("يجب ربط الاشتراك بمعاملة مالية"),
            "blank": _("يجب تحديد المعاملة المالية"),
        },
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("المبلغ"),
        error_messages={
            "invalid": _("يرجى إدخال قيمة مالية صحيحة"),
        },
    )

    date = models.DateField(
        verbose_name=_("تاريخ الاستحقاق"),
        error_messages={
            "invalid": _("أدخل تاريخ صالح"),
        },
    )

    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("ملاحظات"),
    )

    paid_at = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("تاريخ الدفع"),
        error_messages={
            "invalid": _("أدخل تاريخ صالح"),
        },
    )

    class Meta:
        verbose_name = _("اشتراك")
        verbose_name_plural = _("الاشتراكات")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.amount} - ({self.date})"

    def delete(self, using=None, keep_parents=False):
        if self.financial_record:
            self.financial_record.delete()
        return super().delete(using, keep_parents)


class Installment(models.Model):
    class Status(models.TextChoices):
        PAID = "مدفوع", _("مدفوع")
        UNPAID = "غير مدفوع", _("غير مدفوع")

    financial_record = models.OneToOneField(
        "financials.FinancialRecord",
        on_delete=models.SET_NULL,
        related_name="installment",
        verbose_name=_("المعاملة المالية"),
        blank=True,
        null=True,
    )

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.RESTRICT,
        related_name="installments",
        verbose_name=_("العضو"),
        error_messages={
            "null": _("يجب ربط القسط بعضو"),
            "blank": _("يجب تحديد العضو"),
        },
    )

    installment_number = models.PositiveIntegerField(
        verbose_name=_("رقم القسط"),
        help_text=_("الرقم التسلسلي للقسط لهذا العميل"),
    )

    due_date = models.DateField(
        verbose_name=_("تاريخ الاستحقاق"),
        error_messages={
            "invalid": _("يرجى إدخال تاريخ صالح"),
        },
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("القيمة"),
        error_messages={
            "invalid": _("يرجى إدخال قيمة مالية صحيحة"),
        },
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNPAID,
        verbose_name=_("الحالة"),
    )

    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("ملاحظات"),
    )

    paid_at = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("تاريخ الدفع"),
        error_messages={
            "invalid": _("أدخل تاريخ صالح"),
        },
    )

    class Meta:
        verbose_name = _("قسط")
        verbose_name_plural = _("الأقساط")
        ordering = ["client", "installment_number"]
        unique_together = ("client", "installment_number")

    def __str__(self):
        return f"قسط {self.installment_number} - {self.amount} ({self.get_status_display()})"

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.status == self.Status.PAID and not self.paid_at:
            raise ValidationError(
                {"paid_at": _("يجب إدخال تاريخ الدفع إذا كان القسط مدفوعًا")}
            )
        if self.status == self.Status.UNPAID and self.paid_at:
            raise ValidationError(
                {"paid_at": _("لا يمكن إدخال تاريخ الدفع إذا كان القسط غير مدفوع")}
            )

    def delete(self, using=None, keep_parents=False):
        if self.financial_record:
            self.financial_record.delete()
        return super().delete(using, keep_parents)


class Loan(models.Model):
    financial_record = models.OneToOneField(
        "financials.FinancialRecord",
        on_delete=models.CASCADE,
        related_name="loan",
        verbose_name=_("المعاملة المالية"),
        error_messages={
            "null": _("يجب ربط القرض بمعاملة مالية"),
            "blank": _("يجب تحديد المعاملة المالية"),
        },
    )

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.RESTRICT,
        related_name="loans",
        verbose_name=_("العضو"),
        error_messages={
            "null": _("يجب ربط القرض بعضو"),
            "blank": _("يجب تحديد العضو"),
        },
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("قيمة القرض"),
        error_messages={
            "invalid": _("يرجى إدخال قيمة مالية صحيحة"),
        },
    )

    issued_date = models.DateField(
        verbose_name=_("تاريخ إصدار القرض"),
        error_messages={
            "invalid": _("أدخل تاريخ صالح"),
        },
    )

    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("ملاحظات"),
    )

    class Meta:
        verbose_name = _("قرض")
        verbose_name_plural = _("القروض")
        ordering = ["-issued_date"]

    def __str__(self):
        return f"قرض {self.client} - {self.amount} ({self.issued_date})"

    def delete(self, using=None, keep_parents=False):
        if self.financial_record:
            self.financial_record.delete()
        return super().delete(using, keep_parents)

    @property
    def is_completed(self):
        return not self.repayments.filter(status=Repayment.Status.UNPAID).exists()


class Repayment(models.Model):
    class Status(models.TextChoices):
        PAID = "مدفوع", _("مدفوع")
        UNPAID = "غير مدفوع", _("غير مدفوع")

    financial_record = models.OneToOneField(
        "financials.FinancialRecord",
        on_delete=models.SET_NULL,
        related_name="repayment",
        verbose_name=_("المعاملة المالية"),
        blank=True,
        null=True,
    )

    loan = models.ForeignKey(
        "financials.Loan",
        on_delete=models.CASCADE,
        related_name="repayments",
        verbose_name=_("القرض"),
        error_messages={
            "null": _("يجب ربط السداد بقرض"),
            "blank": _("يجب تحديد القرض"),
        },
    )

    repayment_number = models.PositiveIntegerField(
        verbose_name=_("رقم الدفعة"),
        help_text=_("الرقم التسلسلي للدفعة لهذا القرض"),
    )

    due_date = models.DateField(
        verbose_name=_("تاريخ الاستحقاق"),
        error_messages={
            "invalid": _("يرجى إدخال تاريخ صالح"),
        },
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("القيمة"),
        error_messages={
            "invalid": _("يرجى إدخال قيمة مالية صحيحة"),
        },
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNPAID,
        verbose_name=_("الحالة"),
    )

    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("ملاحظات"),
    )

    paid_at = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("تاريخ الدفع"),
        error_messages={
            "invalid": _("أدخل تاريخ صالح"),
        },
    )

    class Meta:
        verbose_name = _("سداد")
        verbose_name_plural = _("السدادات")
        ordering = ["loan", "repayment_number"]
        unique_together = ("loan", "repayment_number")

    def __str__(self):
        return f"سداد {self.repayment_number} - {self.amount} ({self.get_status_display()})"

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.status == self.Status.PAID and not self.paid_at:
            raise ValidationError(
                {"paid_at": _("يجب إدخال تاريخ الدفع إذا كان السداد مدفوعًا")}
            )
        if self.status == self.Status.UNPAID and self.paid_at:
            raise ValidationError(
                {"paid_at": _("لا يمكن إدخال تاريخ الدفع إذا كان السداد غير مدفوع")}
            )

    def delete(self, using=None, keep_parents=False):
        if self.financial_record:
            self.financial_record.delete()
        return super().delete(using, keep_parents)
