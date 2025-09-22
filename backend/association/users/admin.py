from django.contrib import admin
from .models import User, Permission, Module
from django.contrib.auth.models import Group
from .forms import UserAdminForm

admin.site.register(User, UserAdminForm)
admin.site.register(Module)
admin.site.register(Permission)
admin.site.unregister(Group)
