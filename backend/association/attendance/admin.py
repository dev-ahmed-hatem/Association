from django.contrib import admin
from .models import Attendance, Day, AttendanceSettings

admin.site.register(Attendance)
admin.site.register(Day)
admin.site.register(AttendanceSettings)
