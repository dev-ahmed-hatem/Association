import { FC, useState } from "react";
import { Modal, Checkbox, Radio, DatePicker } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { CheckboxOptionType } from "antd/lib";
import dayjs from "dayjs";
import { useNotification } from "@/providers/NotificationProvider";
import { useLazyExportProjectsSheetQuery } from "@/app/api/endpoints/projects";

const { RangePicker } = DatePicker;

interface ExportProjectsProps {
  controls: any;
  search: string;
}

const totalsFields: CheckboxOptionType[] = [
  { label: "اسم المشروع", value: "name" },
  { label: "تاريخ البدء", value: "start_date" },
  { label: "الحالة", value: "status" },
  { label: "إجمالي الإيرادات", value: "total_income" },
  { label: "إجمالي المصروفات", value: "total_expense" },
  { label: "الصافي", value: "net_income" },
  { label: "وقت الإنشاء", value: "created_at" },
  { label: "أنشئ بواسطة", value: "created_by" },
];

const monthSummaryFields: CheckboxOptionType[] = [
  { label: "إجمالي الإيرادات", value: "total_income" },
  { label: "إجمالي المصروفات", value: "total_expense" },
  { label: "الصافي", value: "net_income" },
];

const ExportProjects: FC<ExportProjectsProps> = ({ controls, search }) => {
  const notification = useNotification();
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<"totals" | "monthly">("totals");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    totalsFields.map((f) => f.value)
  );
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [monthRange, setMonthRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);

  const [exportProjectsSheet, { isFetching }] =
    useLazyExportProjectsSheetQuery();

  const currentFields =
    exportType === "totals" ? totalsFields : monthSummaryFields;

  const onChange = (checkedValues: string[]) => {
    setSelectedFields(checkedValues);
    setIndeterminate(
      !!checkedValues.length && checkedValues.length < currentFields.length
    );
    setCheckAll(checkedValues.length === currentFields.length);
  };

  const onCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    setSelectedFields(checked ? currentFields.map((f) => f.value) : []);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const handleExport = async () => {
    if (exportType === "monthly") return;
    if (selectedFields.length === 0) {
      notification.warning({ message: "يرجى اختيار الحقول التي تريد تصديرها" });
      return;
    }
    // if (exportType === "monthly" && !monthRange) {
    //   notification.warning({ message: "يرجى تحديد فترة الشهور للتصدير" });
    //   return;
    // }
    const { data, error } = await exportProjectsSheet({
      type: exportType,
      params: {
        no_pagination: true,
        fields: selectedFields.join(),
        search,
        // start_month:
        //   exportType === "monthly"
        //     ? monthRange?.[0].format("YYYY-MM")
        //     : undefined,
        // end_month:
        //   exportType === "monthly"
        //     ? monthRange?.[1].format("YYYY-MM")
        //     : undefined,
        sort_by: controls?.sort_by,
        order: controls?.order === "descend" ? "-" : "",
      },
    });
    if (error) {
      notification.error({ message: "حدث خطأ أثناء تصدير البيانات" });
      return;
    }
    const blobUrl = window.URL.createObjectURL(data!);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "المشاريع.xlsx";
    // exportType === "monthly" ? "ملخص_شهري.xlsx" : "المشاريع.xlsx";
    link.click();
    window.URL.revokeObjectURL(blobUrl);
    notification.success({ message: "تم تصدير البيانات بنجاح" });
    setOpen(false);
  };

  const handleExportTypeChange = (e: any) => {
    const value = e.target.value;
    setExportType(value);
    const newFields = value === "totals" ? totalsFields : monthSummaryFields;
    setSelectedFields(newFields.map((f) => f.value));
    setCheckAll(true);
    setIndeterminate(false);
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
        <span>تصدير المشاريع</span>
      </button>

      {/* Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-gray-800">
            تصدير بيانات المشاريع
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
        width={520}
      >
        {/* Export type */}
        <div className="mb-4">
          <Radio.Group
            value={exportType}
            onChange={handleExportTypeChange}
            className="flex gap-6"
          >
            <Radio value="totals">تصدير إجمالي المشاريع</Radio>
            <Radio value="monthly">تصدير ملخص شهري</Radio>
          </Radio.Group>
        </div>

        {/* Month range picker */}
        {exportType === "monthly" && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium text-sm">
              اختر فترة الشهور
            </label>
            <RangePicker
              picker="month"
              value={monthRange as any}
              onChange={(val) =>
                setMonthRange(val as [dayjs.Dayjs, dayjs.Dayjs])
              }
              className="w-full"
              format="MMMM YYYY"
              placeholder={["من شهر", "إلى شهر"]}
            />
          </div>
        )}

        {/* Field selection */}
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
          <Checkbox.Group
            style={{ width: "100%" }}
            value={selectedFields}
            onChange={onChange}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentFields.map((field) => (
                <Checkbox key={field.value} value={field.value}>
                  {field.label}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </div>
      </Modal>
    </>
  );
};

export default ExportProjects;
