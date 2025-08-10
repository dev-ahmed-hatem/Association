import { Card } from "antd";
import WorkEntitiesManager from "./WorkEntityManager";

const ClientSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card title="جهات العمل" className="shadow-md">
        <WorkEntitiesManager />
      </Card>
    </div>
  );
};

export default ClientSettingsTab;
