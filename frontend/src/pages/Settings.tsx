import { Tabs } from "antd";
import ClientSettingsTab from "@/components/settings/clients/ClientsSettingsTab";
import FinancialsSettingsTab from "@/components/settings/financials/FinancialsSettingsTab";

const SettingsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">الإعدادات</h1>

      <Tabs
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props} className="md:ps-2" />
        )}
        direction="rtl"
        defaultActiveKey="client"
        items={[
          {
            key: "client",
            label: "الأعضاء",
            children: <ClientSettingsTab />,
          },
          {
            key: "financials",
            label: "الماليات",
            children: <FinancialsSettingsTab />,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
