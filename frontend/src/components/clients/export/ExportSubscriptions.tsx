import { FC } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useNotification } from "@/providers/NotificationProvider";
import { useLazyExportClientYearSubsSheetQuery } from "@/app/api/endpoints/clients";

interface ExportSubscriptionsButtonProps {
  client_name: string;
  client_id: string;
  year: string;
}

const ExportSubscriptionsButton: FC<ExportSubscriptionsButtonProps> = ({
  client_name,
  client_id,
  year,
}) => {
  const notification = useNotification();
  const [exportSubscriptions, { isFetching }] =
    useLazyExportClientYearSubsSheetQuery();

  const handleExport = async () => {
    const { data, error } = await exportSubscriptions({
      client_id,
      year,
      type: "subscriptions",
    });

    if (error || !data) {
      notification.error({ message: "حدث خطأ أثناء تصدير الاشتراكات" });
      return;
    }

    // Create file download
    const blobUrl = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `سجل_اشتراكات_${year}_${client_name}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(blobUrl);

    notification.success({ message: "تم تصدير الاشتراكات بنجاح" });
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      loading={isFetching}
      onClick={handleExport}
      className="bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700 hover:to-green-500 text-white border-none rounded-md shadow-md"
    >
      تصدير اشتراكات السنة
    </Button>
  );
};

export default ExportSubscriptionsButton;
