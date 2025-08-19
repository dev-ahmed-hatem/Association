from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import BankAccountViewSet, TransactionTypeViewSet, FinancialRecordViewSet, RankFeeViewSet

router = DefaultRouter()
router.register('bank-accounts', BankAccountViewSet, basename='bank-account')
router.register('transaction-types', TransactionTypeViewSet, basename='transaction-type')
router.register('financial-records', FinancialRecordViewSet, basename='financial-record')
router.register('rank-fees', RankFeeViewSet, basename='rank-fee')

urlpatterns = [
    path('', include(router.urls)),
]
