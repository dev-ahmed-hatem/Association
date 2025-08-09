from rest_framework import serializers
from .models import Client, WorkEntity
from django.utils.translation import gettext_lazy as _


class WorkEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEntity
        fields = '__all__'


class ClientListSerializer(serializers.ModelSerializer):
    seniority = serializers.SerializerMethodField()
    work_entity = serializers.StringRelatedField(source="work_entity.name")

    class Meta:
        model = Client
        fields = ["id", "name", "membership_number", "rank", "seniority", "work_entity", "is_active"]

    def get_seniority(self, obj: Client):
        return obj.get_seniority()


class ClientReadSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %I:%M%p")
    created_by = serializers.StringRelatedField(source="created_by.name")
    seniority = serializers.SerializerMethodField()
    work_entity = serializers.StringRelatedField(source="work_entity.name")

    class Meta:
        model = Client
        fields = "__all__"

    def get_seniority(self, obj: Client):
        return obj.get_seniority()


class ClientWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Client.objects.all(),
                fields=('class_rank', 'graduation_year'),
                message=_("الترتيب على الدفعة وسنة التخرج مسجلان لعضو اخر.")
            )
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        return super().create({**validated_data, "created_by": user})
