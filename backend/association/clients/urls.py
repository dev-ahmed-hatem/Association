from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkEntityViewSet, ClientViewSet, get_home_stats, get_home_financial_stats

router = DefaultRouter()
router.register('clients', ClientViewSet, basename='client')
router.register('workentities', WorkEntityViewSet, basename='work-entity')

urlpatterns = [
    path('', include(router.urls)),
    path('get-home-stats/', get_home_stats, name='get-home-stats'),
    path('get-home-financial-stats/', get_home_financial_stats, name='get-home-financial-stats'),
]
