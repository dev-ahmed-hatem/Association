from django.contrib import admin
from .models import FinancialRecord, TransactionType, BankAccount

admin.site.register(BankAccount)
admin.site.register(TransactionType)
admin.site.register(FinancialRecord)
