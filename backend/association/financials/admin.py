from django.contrib import admin
from .models import FinancialRecord, TransactionType, BankAccount, RankFee

admin.site.register(BankAccount)
admin.site.register(TransactionType)
admin.site.register(FinancialRecord)
admin.site.register(RankFee)
