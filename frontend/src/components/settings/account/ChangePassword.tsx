import { Card, Form, Input, Button } from "antd";
import { useState, useEffect } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useChangePasswordMutation } from "@/app/api/endpoints/users";
import { handleServerErrors } from "@/utils/handleForm";

export type ChangePasswordFields = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const ChangePassword = () => {
  const notification = useNotification();
  const [form] = Form.useForm<ChangePasswordFields>();
  const [message, setMessage] = useState<string>("");

  const [changePassword, { isLoading, isError, isSuccess, error }] =
    useChangePasswordMutation();

  const handleSubmit = (values: ChangePasswordFields) => {
    setMessage("تم تغيير كلمة المرور بنجاح");
    changePassword(values);
  };

  useEffect(() => {
    if (isError) {
      const err = error as axiosBaseQueryError;
      if (err.status == 400) {
        handleServerErrors({
          errorData: err.data as Record<string, string[]>,
          form,
        });
      } else {
        notification.error({
          message: err.data?.detail ?? "حدث خطأ أثناء تغيير كلمة المرور",
        });
      }
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({ message });
      form.resetFields();
    }
  }, [isSuccess]);

  return (
    <Card title="تغيير كلمة المرور" className="shadow-md mx-auto">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="كلمة المرور الحالية"
          name="current_password"
          rules={[
            { required: true, message: "يرجى إدخال كلمة المرور الحالية" },
          ]}
        >
          <Input.Password placeholder="أدخل كلمة المرور الحالية" />
        </Form.Item>

        <Form.Item
          label="كلمة المرور الجديدة"
          name="new_password"
          rules={[
            { required: true, message: "يرجى إدخال كلمة المرور الجديدة" },
          ]}
        >
          <Input.Password placeholder="أدخل كلمة المرور الجديدة" />
        </Form.Item>

        <Form.Item
          label="تأكيد كلمة المرور الجديدة"
          name="confirm_password"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "يرجى تأكيد كلمة المرور" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("كلمتا المرور غير متطابقتين"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="أعد إدخال كلمة المرور الجديدة" />
        </Form.Item>

        <div className="flex justify-center">
          <Button type="primary" htmlType="submit" size="large" loading={isLoading}>
            تغيير
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default ChangePassword;
