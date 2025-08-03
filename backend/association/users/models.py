from django.db import models
from django.contrib import auth
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, _user_has_perm, Group, \
    Permission


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Users must have username')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        user = self.create_user(username, password, **extra_fields)
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100, default="")
    username = models.CharField(max_length=20, unique=True)
    phone = models.CharField(unique=True, max_length=20, null=True, blank=True)
    national_id = models.CharField(max_length=20, unique=True, null=True, blank=True)

    is_active = models.BooleanField(default=True)

    is_moderator = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_root = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['phone', 'national_id']

    # groups and permissions
    groups = models.ManyToManyField(Group, blank=True, related_name='custom_users')
    user_permissions = models.ManyToManyField(Permission, blank=True, related_name='custom_user_permissions')

    def has_perm(self, perm, obj=None):
        if self.is_superuser:
            return True

        if not self.is_active or self.is_anonymous:
            return False

        if obj is not None:
            return _user_has_perm(self, perm, obj)

        for backend in auth.get_backends():
            if backend.has_perm(self, perm):
                return True

        return False

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_superuser or self.is_moderator
