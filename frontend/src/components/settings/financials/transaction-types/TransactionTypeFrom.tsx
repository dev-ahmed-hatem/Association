import { TransactionType } from "@/types/transaction_type";
import { Modal, Form, Input, Button, Select } from "antd";
import { useEffect } from "react";

interface TransactionTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: TransactionType;
  loading: boolean;
}

const TransactionTypeForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: TransactionTypeFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(initialValues ? { ...initialValues, ...values } : values);
    onClose();
  };

  return (
    <Modal
      title={
        initialValues ? "تعديل نوع معاملة مالية" : "إضافة نوع معاملة مالية"
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-4"
      >
        <Form.Item
          label="اسم المعاملة"
          name="name"
          rules={[{ required: true, message: "يرجى إدخال اسم المعاملة" }]}
        >
          <Input placeholder="أدخل الاسم" />
        </Form.Item>

        <Form.Item
          label="نوع المعاملة"
          name="type"
          rules={[{ required: true, message: "يرجى اختيار نوع المعاملة" }]}
        >
          <Select placeholder="اختر النوع">
            <Select.Option value="إيراد">إيراد</Select.Option>
            <Select.Option value="مصروف">مصروف</Select.Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-4 flex-wrap">
          <Button onClick={onClose} className="mr-2" disabled={loading}>
            إلغاء
          </Button>
          <Button type="primary" htmlType="submit" disabled={loading}>
            حفظ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TransactionTypeForm;
