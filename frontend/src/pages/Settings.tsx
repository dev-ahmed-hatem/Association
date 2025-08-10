import { Tabs } from "antd";
import ClientSettingsTab from "@/components/settings/clients/ClientsSettingsTab";

const SettingsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">الإعدادات</h1>

      <Tabs
        defaultActiveKey="client"
        items={[
          {
            key: "client",
            label: "الأعضاء",
            children: <ClientSettingsTab />,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
