import { FC, useState } from "react";
import { Modal, Checkbox } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { CheckboxOptionType } from "antd/lib";
import { useNotification } from "@/providers/NotificationProvider";
import { useLazyExportFinancialsSheetQuery } from "@/app/api/endpoints/financial_records";
import { ControlsType } from "@/pages/financials/FinancialRecords";
import { TransactionKind } from "@/types/transaction_type";
// import { useLazyExportFinancialsSheetQuery } from "@/app/api/endpoints/financials"; // 👈 you'll create this endpoint

interface ExportFinancialsProps {
  controls?: ControlsType;
  type: TransactionKind;
  from: string;
  to: string;
}

const defaultFields: CheckboxOptionType[] = [
  { label: "المبلغ", value: "amount" },
  { label: "نوع المعاملة", value: "transaction_type" },
  { label: "التاريخ", value: "date" },
  { label: "طريقة الدفع", value: "payment_method" },
  { label: "الحساب البنكي", value: "bank_account" },
  { label: "رقم الإيصال", value: "receipt_number" },
  { label: "ملاحظات", value: "notes" },
  { label: "تاريخ الإنشاء", value: "created_at" },
  { label: "تم الإنشاء بواسطة", value: "created_by" },
];

const ExportFinancials: FC<ExportFinancialsProps> = ({
  controls,
  type,
  from,
  to,
}) => {
  const notification = useNotification();
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    defaultFields.map((f) => f.value as string)
  );
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);

  const [exportFinancialsSheet, { isFetching }] =
    useLazyExportFinancialsSheetQuery();

  // Handle individual checkbox selection
  const onChange = (checkedValues: string[]) => {
    setSelectedFields(checkedValues);
    setIndeterminate(
      !!checkedValues.length && checkedValues.length < defaultFields.length
    );
    setCheckAll(checkedValues.length === defaultFields.length);
  };

  // Handle select all toggle
  const onCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    setSelectedFields(
      checked ? defaultFields.map((f) => f.value as string) : []
    );
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      notification.warning({ message: "يرجى اختيار الحقول التي تريد تصديرها" });
      return;
    }

    const { data, error } = await exportFinancialsSheet({
      no_pagination: true,
      fields: selectedFields.join(),
      type,
      from,
      to,
      sort_by: controls?.sort_by,
      order: controls?.order === "descend" ? "-" : "",
      payment_methods: controls?.filters.payment_method,
      transaction_types: controls?.filters.transaction_type,
      bank_accounts: controls?.filters.bank_account,
    });

    if (error) {
      notification.error({ message: "حدث خطأ أثناء تصدير البيانات" });
      return;
    }

    const blobUrl = window.URL.createObjectURL(data!);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `السجلات_المالية (${type}ات).xlsx`;
    link.click();
    window.URL.revokeObjectURL(blobUrl);

    notification.success({ message: "تم تصدير البيانات بنجاح" });
    setOpen(false);
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setOpen(true)}
        className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
          hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
          transition-all duration-200"
      >
        <DownloadOutlined />
        <span>تصدير السجلات المالية</span>
      </button>

      {/* Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-gray-800">
            اختيار الحقول للتصدير
          </span>
        }
        open={open}
        onOk={handleExport}
        onCancel={() => setOpen(false)}
        okText="تصدير"
        cancelText="إلغاء"
        okButtonProps={{
          className:
            "bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700 hover:to-green-500 text-white border-none rounded-md shadow-md",
          loading: isFetching,
        }}
        cancelButtonProps={{
          className: "text-gray-600 border-gray-300 hover:text-gray-800",
          disabled: isFetching,
        }}
        centered
        width={480}
      >
        <p className="text-gray-600 mb-3 text-sm">
          اختر الحقول التي ترغب في تضمينها في ملف Excel، أو حدد "تحديد الكل".
        </p>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {/* Select All */}
          <div className="flex items-center mb-3">
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              <span className="font-medium text-gray-700">تحديد الكل</span>
            </Checkbox>
          </div>

          {/* Field list */}
          <div>
            <Checkbox.Group
              style={{ width: "100%" }}
              value={selectedFields}
              onChange={onChange}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defaultFields.map((field) => (
                  <Checkbox key={field.value} value={field.value}>
                    {field.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExportFinancials;
