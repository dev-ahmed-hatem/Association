import { Form, Input, Select, DatePicker, Button, Card, message } from "antd";
import dayjs from "dayjs";
import { FinancialRecord } from "@/types/financial_item";
import { useEffect } from "react";

const { Option } = Select;

type FinancialFormProps = {
  onSubmit?: (values: FinancialRecord) => void;
  categories?: string[];
  initialValues?: Partial<FinancialRecord>;
  financialRecord: "income" | "expense";
};

const FinancialForm = ({
  onSubmit,
  categories = [],
  initialValues,
  financialRecord,
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
    // const formattedValues: FinancialRecord = {
    //   id: initialValues?.id || crypto.randomUUID(),
    //   type: financialRecord,
    //   amount: Number(values.amount),
    //   category: values.category,
    //   description: values.description || "",
    //   date: values.date.format("YYYY-MM-DD"),
    // };
    // onSubmit?.(formattedValues);
    // message.success(`تم حفظ ${financialRecord === "income" ? "الإيراد" : "المصروف"} بنجاح`);
  };

  const isEditing = Boolean(initialValues);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-right">
        {isEditing ? "تعديل" : "إضافة"}{" "}
        {financialRecord === "income" ? "إيراد" : "مصروف"}
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
            <Input.TextArea
              rows={3}
              placeholder={`أدخل وصف ${
                financialRecord === "income" ? "الإيراد" : "المصروف"
              } (اختياري)`}
            />
          </Form.Item>
        </Card>

        <Form.Item className="text-center mt-5">
          <Button type="primary" htmlType="submit" size="large">
            {isEditing
              ? `تحديث ${financialRecord === "income" ? "الإيراد" : "المصروف"}`
              : `إضافة ${financialRecord === "income" ? "إيراد" : "مصروف"}`}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default FinancialForm;
