from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .serializers import UserSerializer
from .models import User

# for getting models permissions
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super(UserViewSet, self).get_queryset()

        search_query = self.request.query_params.get('search', None)

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(username__icontains=search_query) |
                Q(national_id__icontains=search_query) |
                Q(phone__icontains=search_query)
            )

        is_superuser_param = self.request.query_params.get('is_superuser', None)
        if is_superuser_param:
            if is_superuser_param.lower() == 'true':
                queryset = queryset.filter(is_superuser=True)

        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_permissions(request):
    user_permissions = {}
    username = request.GET.get('username', None)
    if username is not None:
        try:
            user = User.objects.get(username=username)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
    else:
        user = request.user
    permissions = user.get_user_permissions()
    return Response(data=permissions, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_models_permissions(request):
    user_permissions = {}
    user = request.user
    data = request.data
    models = [apps.get_model(app_label, model_name) for app_label, model_name in
              (model.split(".") for model in data["models"])]
    for model in models:
        content_type = ContentType.objects.get_for_model(model)
        model_permissions = Permission.objects.filter(content_type=content_type)
        permissions = user.user_permissions.filter(id__in=model_permissions)
        user_permissions[f"{model._meta.app_label}.{model._meta.model_name}"] = [permission.codename for permission in
                                                                                 permissions]

    # model = apps.get_model('users', user.username)
    return Response(data=user_permissions, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_user_permissions(request):
    try:
        permission_list = request.data.get("permissions", [])
        username = request.data.get("username", None)
        print(permission_list)
        print(username)
        user = User.objects.get(username=username)
        user.user_permissions.clear()
        for permission in permission_list:
            print(permission)
            permission = permission.split(".")[-1]
            perm = Permission.objects.filter(codename=permission).first()
            if perm:
                user.user_permissions.add(perm)
        user.save()
        return Response(status=status.HTTP_200_OK)
    except:
        return Response(status=status.HTTP_400_BAD_REQUEST)
