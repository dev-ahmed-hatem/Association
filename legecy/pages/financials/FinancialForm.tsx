import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
} from "antd";
import dayjs from "dayjs";
import { FinancialItem } from "../../types/financial_item";
import { useEffect } from "react";

const { Option } = Select;

type FinancialFormProps = {
  onSubmit?: (values: FinancialItem) => void;
  categories?: string[];
  initialValues?: Partial<FinancialItem>;
  financialItem: "income" | "expense";
};

const FinancialForm = ({
  onSubmit,
  categories = [],
  initialValues,
  financialItem,
}: FinancialFormProps) => {
  const [form] = Form.useForm();

  // Set form values if editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : dayjs(),
      });
    }
  }, [initialValues, form]);

  const onFinish = (values: any) => {
    const formattedValues: FinancialItem = {
      id: initialValues?.id || crypto.randomUUID(),
      type: financialItem,
      amount: Number(values.amount),
      category: values.category,
      description: values.description || "",
      date: values.date.format("YYYY-MM-DD"),
    };

    onSubmit?.(formattedValues);
    message.success(`تم حفظ ${financialItem === "income" ? "الإيراد" : "المصروف"} بنجاح`);
  };

  const isEditing = Boolean(initialValues);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-right">
        {isEditing ? "تعديل" : "إضافة"} {financialItem === "income" ? "إيراد" : "مصروف"}
      </h1>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card title="بيانات العملية المالية">
          <Form.Item
            name="amount"
            label="المبلغ"
            rules={[{ required: true, message: "يرجى إدخال المبلغ" }]}
          >
            <Input type="number" placeholder="أدخل المبلغ" />
          </Form.Item>

          <Form.Item
            name="category"
            label="الفئة"
            rules={[{ required: true, message: "يرجى اختيار الفئة" }]}
          >
            <Select placeholder="اختر فئة">
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="التاريخ"
            rules={[{ required: true, message: "يرجى اختيار التاريخ" }]}
          >
            <DatePicker format="YYYY-MM-DD" className="w-full" />
          </Form.Item>

          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder={`أدخل وصف ${financialItem === "income" ? "الإيراد" : "المصروف"} (اختياري)`} />
          </Form.Item>
        </Card>

        <Form.Item className="text-center mt-5">
          <Button type="primary" htmlType="submit" size="large">
            {isEditing
              ? `تحديث ${financialItem === "income" ? "الإيراد" : "المصروف"}`
              : `إضافة ${financialItem === "income" ? "إيراد" : "مصروف"}`}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default FinancialForm;
