from django.db.models.signals import post_migrate
from .models import Module, Permission

modules_perms = {
    "الأعضاء": ["عرض", "إضافة", "تعديل", "حذف"],
    "المشروعات": ["عرض", "إضافة", "تعديل", "حذف"],
    "الإيرادات": ["عرض", "إضافة", "تعديل", "حذف"],
    "المصروفات": ["عرض", "إضافة", "تعديل", "حذف"],
    "الاشتراكات": ["عرض", "إضافة", "تعديل", "حذف"],
    "الأقساط": ["عرض", "إضافة", "تعديل", "حذف"],
    "القروض": ["عرض", "إضافة", "تعديل", "حذف"],
    "الإعدادات": ["جهات العمل", "الحسابات البنكية", "أنواع المعاملات المالية", "الاشتراكات حسب الرتبة"],
}


def create_modules_permissions(sender, **kwargs):
    if sender.label == "users":
        for module in modules_perms:
            module_obj, _ = Module.objects.get_or_create(name=module, slug=module)
            for perm in modules_perms[module]:
                perm_obj, _ = Permission.objects.get_or_create(module=module_obj, action=perm)
        print("✅ Created modules permissions.")


post_migrate.connect(create_modules_permissions)
