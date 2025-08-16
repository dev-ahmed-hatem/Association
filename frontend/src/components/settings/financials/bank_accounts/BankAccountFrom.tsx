import { BankAccount } from "@/types/bank_account";
import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";

interface BankAccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: BankAccount;
  loading: boolean;
}

const BankAccountForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: BankAccountFormProps) => {
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
      title={initialValues ? "تعديل الحساب البنكي" : "إضافة حساب بنكي"}
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
          label="اسم الحساب البنكي"
          name="name"
          rules={[{ required: true, message: "يرجى إدخال اسم الحساب البنكي" }]}
        >
          <Input placeholder="أدخل الاسم" />
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

export default BankAccountForm;
