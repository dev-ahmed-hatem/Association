import { FC } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useNotification } from "@/providers/NotificationProvider";
import { useLazyExportClientFinancialsSheetQuery } from "@/app/api/endpoints/clients";

interface ExportClientFinancialsButtonProps {
  client_name: string;
  client_id: string;
  year?: string;
  type: "subscriptions" | "installments";
}

const ExportClientFinancialsButton: FC<ExportClientFinancialsButtonProps> = ({
  client_name,
  client_id,
  year = undefined,
  type,
}) => {
  const notification = useNotification();
  const [exportFinancials, { isFetching }] =
    useLazyExportClientFinancialsSheetQuery();

  const handleExport = async () => {
    const { data, error } = await exportFinancials({
      client_id,
      year,
      type: type,
    });

    if (error || !data) {
      notification.error({
        message: `حدث خطأ أثناء تصدير ${
          type === "subscriptions" ? "الاشتراكات" : "سجل الأقساط"
        }`,
      });
      return;
    }

    // Create file download
    const blobUrl = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download =
      type === "subscriptions"
        ? `سجل_اشتراكات_${year}_${client_name}.xlsx`
        : `سجل_أقساط_${client_name}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(blobUrl);

    notification.success({
      message: `تم تصدير ${
        type === "subscriptions" ? "الاشتراكات" : "سجل الأقساط"
      } بنجاح`,
    });
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      loading={isFetching}
      onClick={handleExport}
      className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
          hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
          transition-all duration-200"
    >
      تصدير {type === "subscriptions" ? "اشتراكات السنة" : "سجل الأقساط"}
    </Button>
  );
};

export default ExportClientFinancialsButton;
