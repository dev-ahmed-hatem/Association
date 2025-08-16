from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import BankAccountViewSet, TransactionTypeViewSet

router = DefaultRouter()
router.register('bank-accounts', BankAccountViewSet, basename='bank-account')
router.register('transaction-types', TransactionTypeViewSet, basename='transaction-type')

urlpatterns = [
    path('', include(router.urls)),
]
