from datetime import datetime, timedelta, time
from typing import Optional

from hrms.rest_framework_utils.custom_pagination import CustomPageNumberPagination
from .models import Attendance, AttendanceSettings
from .serializers import AttendanceWriteSerializer, AttendanceReadSerializer, AttendanceSettingsReadSerializer, \
    AttendanceSettingsWriteSerializer
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.utils.translation import gettext_lazy as _


class AttendanceViewSet(viewsets.ModelViewSet):
    pagination_class = None

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AttendanceWriteSerializer
        return AttendanceReadSerializer

    def get_queryset(self):
        queryset = Attendance.objects.all()
        date = self.request.query_params.get("date", None)
        if date is not None:
            queryset = queryset.filter(date=date)
        return queryset


def calculate_deduction(checkin: time, checkout: Optional[time]):
    today = datetime.today().date()
    attendance_settings = AttendanceSettings.objects.first()

    checkin_date = datetime.combine(today, checkin)
    checkout_date = datetime.combine(today, checkout) if checkout else None
    grace_period = timedelta(minutes=15)

    standard_checkin = datetime.combine(today, attendance_settings.check_in)
    standard_checkout = datetime.combine(today, attendance_settings.check_out)

    # calculate late minutes and compare with grace period
    late_minutes = 0
    if checkin_date - standard_checkin > grace_period:
        late_delta = checkin_date - standard_checkin
        late_minutes = late_delta.total_seconds() / 60

    # check if there early leave minutes
    early_leave = 0
    if checkout and standard_checkout - checkout_date >= timedelta(minutes=1):
        early_delta = standard_checkout - checkout_date
        early_leave = early_delta.total_seconds() / 60

    return late_minutes + early_leave


def calculate_extra(check_out: Optional[time]):
    if not check_out:
        return None

    today = datetime.today().date()
    attendance_settings = AttendanceSettings.objects.first()

    checkout_date = datetime.combine(today, check_out)
    standard_checkout = datetime.combine(today, attendance_settings.check_out)

    if checkout_date - standard_checkout > timedelta(minutes=0):
        extra_delta = checkout_date - standard_checkout
        return extra_delta.total_seconds() / 60
    return None


@api_view(['GET'])
def get_attendance_summary(request):
    date = request.query_params.get("date", None)
    if date is None:
        return Response({"detail": _('يجب توفير تاريخ اليوم')}, status=status.HTTP_400_BAD_REQUEST)

    attendances = Attendance.objects.filter(date=date)

    paginator = CustomPageNumberPagination()
    paginator.page_size = 10
    paginated_result = paginator.paginate_queryset(attendances, request)

    records = [{
        "employee": record.employee.name,
        "check_in": record.check_in,
        "check_out": record.check_out,
        "deductions": calculate_deduction(record.check_in, record.check_out),
        "extra": calculate_extra(record.check_out)
    }
        for record in paginated_result]

    data = {
        'total_pages': paginator.page.paginator.num_pages,
        'page': paginator.page.number,
        'count': paginator.page.paginator.count,
        'next': paginator.get_next_link(),
        'previous': paginator.get_previous_link(),
        "data": records,

    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
def update_day_attendance(request):
    date = request.data.get("date", None)
    records = request.data.get("records", [])

    if date is None:
        return Response({"detail": _('يجب توفير تاريخ اليوم')}, status=status.HTTP_400_BAD_REQUEST)

    for record in records:
        if record["saved"]:
            attendance = Attendance.objects.get(pk=record["id"])
            serializer = AttendanceWriteSerializer(attendance, data=record, partial=True, context={"request": request})
            if serializer.is_valid():
                serializer.save()
        else:
            serializer = AttendanceWriteSerializer(data={**record, "date": date}, context={"request": request})
            if serializer.is_valid():
                serializer.save()

    return Response()


class AttendanceSettingsView(APIView):
    def get(self, request):
        instance = AttendanceSettings.objects.first()
        if instance is None:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

        serializer = AttendanceSettingsReadSerializer(instance, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        instance = AttendanceSettings.objects.first()
        if instance is None:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

        serializer = AttendanceSettingsWriteSerializer(instance, data=request.data, partial=True,
                                                       context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
