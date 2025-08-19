import { RankFee } from "@/types/rank_fee";
import { Modal, Form, Button, InputNumber } from "antd";
import { useEffect } from "react";

interface RankFeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues: RankFee;
  loading: boolean;
}

const RankFeeForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: RankFeeFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(initialValues ? { ...initialValues, ...values } : values);
    onClose();
  };

  return (
    <Modal
      title={`تعديل قيمة اشتراك ${initialValues?.rank}`}
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
          label="قيمة الاشتراك"
          name="fee"
          rules={[{ required: true, message: "يرجى إدخال قيمة الاشتراك" }]}
        >
          <InputNumber placeholder="أدخل قيمة الاشتراك" className="w-full" />
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

export default RankFeeForm;
