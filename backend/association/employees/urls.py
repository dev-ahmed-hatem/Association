from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, EmployeeViewSet, multiple_delete
from django.urls import path, include

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('', include(router.urls)),
    path('multiple-delete/', multiple_delete, name="multiple-delete"),
]
