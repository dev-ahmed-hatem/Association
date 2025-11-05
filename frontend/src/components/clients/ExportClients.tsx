import { FC, useState } from "react";
import { Modal, Checkbox, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { CheckboxOptionType } from "antd/lib";
import { ControlsType } from "@/pages/clients/ClientsList";

interface ExportClientsProps {
  controls: ControlsType;
}

const defaultFields: CheckboxOptionType["value"][] = [
  // { label: "ID", value: "id" },
  { label: "الرتبة", value: "rank" },
  { label: "الاسم", value: "name" },
  { label: "رقم العضوية", value: "membership_number" },
  { label: "الأقدمية", value: "seniority" },
  { label: "تاريخ الاشتراك", value: "subscription_date" },
  { label: "جهة العمل", value: "work_entity" },
  { label: "العمر", value: "age" },
  { label: "الرقم القومي", value: "national_id" },
  { label: "تاريخ الميلاد", value: "birth_date" },
  { label: "محل الإقامة", value: "residence" },
  { label: "رقم الهاتف", value: "phone_number" },
  { label: "نوع العضوية", value: "membership_type" },
  { label: "الحالة الاجتماعية", value: "marital_status" },
  { label: "سنة التخرج", value: "graduation_year" },
  { label: "الترتيب على الدفعة", value: "class_rank" },
  { label: "ملاحظات", value: "notes" },
  { label: "في الخدمة", value: "is_active" },
  { label: "تاريخ الإنشاء", value: "created_at" },
  { label: "تم الإنشاء بواسطة", value: "created_by" },
];

const ExportClients: FC<ExportClientsProps> = ({ controls }) => {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    defaultFields.map((f) => f.value)
  );
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);

  // Handle individual checkbox selection
  const onChange = (checkedValues: string[]) => {
    // مهما كنت ابن مين .. متلعبش هناااا
    setSelectedFields(checkedValues);
    setIndeterminate(
      !!checkedValues.length && checkedValues.length < defaultFields.length
    );
    setCheckAll(checkedValues.length === defaultFields.length);
  };

  // Handle select all toggle
  const onCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    setSelectedFields(checked ? defaultFields.map((f) => f.value) : []);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      message.warning("يرجى اختيار الحقول التي تريد تصديرها");
      return;
    }

    try {
      const params = new URLSearchParams({
        fields: selectedFields.join(","),
      });

      const response = await fetch(`${exportUrl}?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        message.error("حدث خطأ أثناء تصدير البيانات");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "clients_export.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);

      message.success("تم تصدير البيانات بنجاح ✅");
      setOpen(false);
    } catch (err) {
      console.error(err);
      message.error("تعذر الاتصال بالخادم");
    }
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
        <span>تصدير إلى Excel</span>
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
        }}
        cancelButtonProps={{
          className: "text-gray-600 border-gray-300 hover:text-gray-800",
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

export default ExportClients;
