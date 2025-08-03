from rest_framework import serializers
from .models import Department, Employee
from django.conf import settings


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class EmployeeReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='employee-detail')
    department = serializers.StringRelatedField(read_only=True)
    gender = serializers.CharField(read_only=True, source='get_gender_display')
    marital_status = serializers.CharField(read_only=True, source='get_marital_status_display')
    mode = serializers.CharField(read_only=True, source='get_mode_display')
    created_by = serializers.CharField(read_only=True, source='created_by.name')
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_created_at(self, obj: Employee) -> str:
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime('%Y-%m-%d')


class EmployeeListSerializer(serializers.ModelSerializer):
    department = serializers.StringRelatedField(read_only=True)
    assignments = serializers.SerializerMethodField()
    url = serializers.HyperlinkedIdentityField(view_name='employee-detail')

    class Meta:
        model = Employee
        fields = ['id', 'url', 'name', 'position', 'employee_id', 'assignments', 'image', 'department', 'is_active']

    def get_assignments(self, obj):
        return 5


class EmployeeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        exclude = ['created_by', 'is_active']

    def create(self, validated_data):
        auth_user = self.context['request'].user
        return Employee.objects.create(**validated_data, created_by=auth_user)

    def update(self, instance: Employee, validated_data):
        cv = validated_data.pop('cv', None)
        image = validated_data.pop('image', None)

        birth_date = validated_data.get("birth_date")
        if birth_date:
            instance.age = calculate_age(birth_date)

        instance = super().update(instance, validated_data)

        if cv:
            if instance.cv:
                instance.cv.delete(save=False)
            instance.cv = cv

        if image:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = image

        instance.save()
        return instance
