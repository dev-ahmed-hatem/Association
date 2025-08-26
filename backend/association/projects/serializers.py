from .models import Project
from rest_framework import serializers


class ProjectSerializer(serializers.ModelSerializer):
    total_incomes = serializers.SerializerMethodField()
    total_expenses = serializers.SerializerMethodField()
    net = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_total_incomes(self, obj):
        return 100

    def get_total_expenses(self, obj):
        return 50

    def get_net(self, obj):
        return 50
