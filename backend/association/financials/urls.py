from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import BankAccountViewSet, TransactionTypeViewSet, FinancialRecordViewSet, RankFeeViewSet, \
    SubscriptionViewSet, get_year_subscriptions, InstallmentViewSet, get_financials_stats

router = DefaultRouter()
router.register('bank-accounts', BankAccountViewSet, basename='bank-account')
router.register('transaction-types', TransactionTypeViewSet, basename='transaction-type')
router.register('financial-records', FinancialRecordViewSet, basename='financial-record')
router.register('rank-fees', RankFeeViewSet, basename='rank-fee')
router.register('subscriptions', SubscriptionViewSet, basename='subscription')
router.register('installments', InstallmentViewSet, basename='installment')

urlpatterns = [
    path('', include(router.urls)),
    path('get-year-subscriptions/', get_year_subscriptions, name='year-subscriptions'),
    path('get-financials-stats/', get_financials_stats, name='get-financial-stats'),
]
