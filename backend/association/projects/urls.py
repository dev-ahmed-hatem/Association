from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProjectViewSet, ProjectTransactionViewSet, get_projects_stats

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('project-transactions', ProjectTransactionViewSet, basename='project-transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('get-projects-stats/', get_projects_stats, name='get-projects-stats'),
]
