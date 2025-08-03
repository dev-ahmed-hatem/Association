from rest_framework import serializers
from .models import Attendance, AttendanceSettings


class AttendanceReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='attendance-detail')
    employee = serializers.SerializerMethodField()
    check_in = serializers.SerializerMethodField()
    check_out = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = ['id', 'url', 'employee', 'date', 'check_in', 'check_out']

    def get_check_in(self, obj):
        return obj.check_in.strftime('%H:%M')

    def get_check_out(self, obj):
        return obj.check_out.strftime('%H:%M') if obj.check_out else None

    def get_employee(self, obj):
        return {"name": obj.employee.name, "id": obj.employee.id}


class AttendanceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'


class AttendanceSettingsReadSerializer(serializers.ModelSerializer):
    check_in = serializers.SerializerMethodField()
    check_out = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSettings
        fields = ["check_in", "check_out", "grace_period", "working_days"]

    def get_check_in(self, obj):
        return obj.check_in.strftime('%H:%M')

    def get_check_out(self, obj):
        return obj.check_out.strftime('%H:%M') if obj.check_out else None


class AttendanceSettingsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSettings
        fields = "__all__"
