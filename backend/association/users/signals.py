from django.db.models.signals import post_migrate
from .models import Module, Permission

modules_perms = {
    "clients": ["view", "add", "edit", "delete"],
    "projects": ["view", "add", "edit", "delete"],
    "incomes": ["view", "add", "edit", "delete"],
    "expenses": ["view", "add", "edit", "delete"],
    "subscriptions": ["view", "add", "delete"],
    "installments": ["view", "add", "delete"],
    "loans": ["view", "add", "delete", "viewRepayments", "addRepayment", "deleteRepayment"],
    "settings": [
        "workEntities",
        "bankAccounts",
        "financialTransactionTypes",
        "rankBasedSubscriptions",
    ],
}


def create_modules_permissions(sender, **kwargs):
    if sender.label == "users":
        for module in modules_perms:
            module_obj, _ = Module.objects.get_or_create(name=module, slug=module)
            for perm in modules_perms[module]:
                perm_obj, _ = Permission.objects.get_or_create(module=module_obj, action=perm)
        print("✅ Created modules permissions.")


post_migrate.connect(create_modules_permissions)
