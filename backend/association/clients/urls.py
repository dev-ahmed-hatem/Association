from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkEntityViewSet, ClientViewSet

router = DefaultRouter()
router.register('clients', ClientViewSet, basename='client')
router.register('workentities', WorkEntityViewSet, basename='work-entity')

urlpatterns = [
    path('', include(router.urls)),
]
