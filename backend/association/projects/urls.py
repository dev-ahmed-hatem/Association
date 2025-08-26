from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProjectViewSet, ProjectTransactionViewSet

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('project-transactions', ProjectTransactionViewSet, basename='project-transaction')

urlpatterns = [
    path('', include(router.urls)),
]
