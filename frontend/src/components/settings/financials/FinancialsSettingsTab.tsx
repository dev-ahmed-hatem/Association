import { usePermission } from "@/providers/PermissionProvider";
import BankAccountManager from "./bank_accounts/BankAccountManager";
import RankFeeManager from "./rank-fees/RankFeeManager";
import TransactionTypeManager from "./transaction-types/TransactionTypeManager";

const FinancialsSettingsTab = () => {
  const { can } = usePermission();
  return (
    <div className="space-y-6">
      {can("settings.workEntities") ? (
        <BankAccountManager />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-600 text-lg">
            عذراً، لا تملك صلاحية للوصول إلى إعدادات الحسابات البنكية
          </p>
        </div>
      )}
      {can("settings.workEntities") ? (
        <TransactionTypeManager />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-600 text-lg">
            عذراً، لا تملك صلاحية للوصول إلى إعدادات أنواع المعاملات المالية
          </p>
        </div>
      )}
      {can("settings.workEntities") ? (
        <RankFeeManager />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-600 text-lg">
            عذراً، لا تملك صلاحية للوصول إلى إعدادات الاشتراكات حسب الرتبة
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialsSettingsTab;
