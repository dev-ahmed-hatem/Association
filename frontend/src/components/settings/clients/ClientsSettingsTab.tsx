import { usePermission } from "@/providers/PermissionProvider";
import WorkEntitiesManager from "./WorkEntityManager";

const ClientSettingsTab = () => {
  const { can } = usePermission();
  return (
    <div className="space-y-6">
      {can("settings.workEntities") ? (
        <WorkEntitiesManager />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-600 text-lg">
            عذراً، لا تملك صلاحية للوصول إلى إعدادات جهات العمل
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientSettingsTab;
