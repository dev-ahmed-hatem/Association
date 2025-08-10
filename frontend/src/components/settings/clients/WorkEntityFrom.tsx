import { WorkEntity } from "@/types/workentity";
import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";

interface WorkEntityFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: WorkEntity;
  loading: boolean;
}

const WorkEntityForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: WorkEntityFormProps) => {
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
      title={initialValues ? "تعديل جهة العمل" : "إضافة جهة عمل"}
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
          label="اسم جهة العمل"
          name="name"
          rules={[{ required: true, message: "يرجى إدخال اسم جهة العمل" }]}
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

export default WorkEntityForm;
