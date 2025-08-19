from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from .models import Client, WorkEntity
from financials.models import RankFee


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
    created_at = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField(source="created_by.name")
    seniority = serializers.SerializerMethodField()
    work_entity = serializers.StringRelatedField(source="work_entity.name")
    age = serializers.SerializerMethodField()
    rank_fee = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = "__all__"

    def get_age(self, obj: Client):
        return obj.age

    def get_created_at(self, obj: Client):
        return obj.created_at.astimezone(settings.CAIRO_TZ).strftime("%Y-%m-%d %I:%M%p")

    def get_seniority(self, obj: Client):
        return obj.get_seniority()

    def get_rank_fee(self, obj: Client):
        return RankFee.objects.get(rank=obj.rank).fee


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
