from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    # path('get_models_permissions/', get_models_permissions, name='get_models_permissions'),
    # path('get_user_permissions/', get_user_permissions, name='get_user_permissions'),
    # path('set_user_permissions/', set_user_permissions, name='set_user_permissions'),
]
