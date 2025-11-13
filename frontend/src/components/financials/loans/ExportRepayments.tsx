import { FC } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useNotification } from "@/providers/NotificationProvider";
import { useLazyExportRepaymentsSheetQuery } from "@/app/api/endpoints/loans";

interface ExportRepaymentsButtonProps {
  client_name: string;
  loan_id: string;
}

const ExportRepaymentsButton: FC<ExportRepaymentsButtonProps> = ({
  client_name,
  loan_id,
}) => {
  const notification = useNotification();
  const [exportFinancials, { isFetching }] =
    useLazyExportRepaymentsSheetQuery();

  const handleExport = async () => {
    const { data, error } = await exportFinancials({
      loan_id,
    });

    if (error || !data) {
      notification.error({
        message: `حدث خطأ أثناء تصدير سجل دفع القرض`,
      });
      return;
    }

    // Create file download
    const blobUrl = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `سجل_دفع_قرض_${client_name.replace(/ /g, "_")}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(blobUrl);

    notification.success({
      message: `تم تصدير سجل دفع القرض بنجاح`,
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
      تصدير سجل دفع القرض
    </Button>
  );
};

export default ExportRepaymentsButton;
