from django.apps import apps
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.dispatch import receiver
from django.db.models.signals import post_migrate


@reciever(post_migrate)
def create_custom_permissions(sender, **kwargs):
    for model in apps.get_models():
        content_type = ContentType.objects.get_for_model(model)

        permissions = [
            (f"add_{model._meta.model_name}", f"Can add {model._meta.model_name}"),
            (f"change_{model._meta.model_name}", f"Can change {model._meta.model_name}"),
            (f"delete_{model._meta.model_name}", f"Can delete {model._meta.model_name}"),
            (f"view_{model._meta.model_name}", f"Can view {model._meta.model_name}"),
        ]

        for codename, name in permissions:
            Permission.objects.get_or_create(codename=codename, name=name, content_type=content_type)
