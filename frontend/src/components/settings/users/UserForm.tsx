import { Modal, Form, Input, Button, Select, FormInstance } from "antd";
import { useEffect } from "react";
import { User } from "@/types/user";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: User;
  loading: boolean;
  form: FormInstance;
  changePassword?: boolean;
}

const UserForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
  form,
  changePassword = false,
}: UserFormProps) => {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        username: initialValues.username,
        role: initialValues.role,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    if (initialValues) {
      // Exclude password fields if empty on edit
      const { password, password2, ...rest } = values;
      const updated = {
        ...initialValues,
        ...rest,
        ...(password ? { password, password2 } : {}),
      };
      onSubmit(updated);
    } else {
      onSubmit(values);
    }
  };

  return (
    <Modal
      title={initialValues ? "تعديل مستخدم" : "إضافة مستخدم"}
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
        {!changePassword && (
          <>
            <Form.Item
              label="الاسم"
              name="name"
              rules={[{ required: true, message: "يرجى إدخال الاسم" }]}
            >
              <Input placeholder="أدخل الاسم" />
            </Form.Item>

            <Form.Item
              label="اسم المستخدم"
              name="username"
              rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
            >
              <Input placeholder="أدخل اسم المستخدم" />
            </Form.Item>

            <Form.Item
              label="الدور"
              name="role"
              rules={[{ required: true, message: "يرجى اختيار الدور" }]}
            >
              <Select placeholder="اختر الدور">
                <Select.Option value="مدير">مدير</Select.Option>
                <Select.Option value="مشرف">مشرف</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}

        {(!initialValues || changePassword) && (
          <>
            <Form.Item
              label="كلمة المرور"
              name="password"
              rules={
                initialValues
                  ? []
                  : [{ required: true, message: "يرجى إدخال كلمة المرور" }]
              }
            >
              <Input.Password placeholder="أدخل كلمة المرور" />
            </Form.Item>

            <Form.Item
              label="تأكيد كلمة المرور"
              name="password2"
              dependencies={["password"]}
              rules={[
                {
                  required: !initialValues,
                  message: "يرجى تأكيد كلمة المرور",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("كلمتا المرور غير متطابقتين")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="أعد إدخال كلمة المرور" />
            </Form.Item>
          </>
        )}

        <div className="flex justify-end gap-4 flex-wrap">
          <Button onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UserForm;
