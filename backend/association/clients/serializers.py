from rest_framework import serializers
from .models import Client, WorkEntity


class WorkEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEntity
        fields = '__all__'


class ClientListSerializer(serializers.ModelSerializer):
