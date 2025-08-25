import { Form, Input, DatePicker, Button, Card, Row, Col } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";
import { handleServerErrors } from "@/utils/handleForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useProjectMutation } from "@/app/api/endpoints/projects";

type ProjectFormProps = {
  initialValues?: { id?: number; name?: string; start_date?: string };
};

const ProjectForm = ({ initialValues }: ProjectFormProps) => {
  const [form] = Form.useForm();
  const notification = useNotification();
  const navigate = useNavigate();

  const [
    handleProject,
    { data: project, isLoading, isError, error, isSuccess },
  ] = useProjectMutation();

  const onFinish = (values: any) => {
    const data = {
      ...values,
      start_date: values.start_date.format("YYYY-MM-DD"),
    };

    handleProject({
      data,
      url: initialValues
        ? `/projects/projects/${initialValues.id}/`
        : undefined,
      method: initialValues ? "PATCH" : "POST",
    });
  };

  useEffect(() => {
    if (isError) {
      const err = error as axiosBaseQueryError;
      if (err.status === 400) {
        handleServerErrors({
          errorData: err.data as Record<string, string[]>,
          form,
        });
      }
      notification.error({ message: "خطأ في حفظ المشروع!" });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess && project) {
      notification.success({
        message: `تم ${initialValues ? "تعديل" : "إضافة"} المشروع`,
      });
      navigate(`/projects/project-profile/${project.id}`);
    }
  }, [isSuccess, project]);

  const isEditing = Boolean(initialValues);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-right">
        {isEditing ? "تعديل" : "إضافة"} مشروع
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...initialValues,
          start_date: initialValues?.start_date
            ? dayjs(initialValues.start_date)
            : dayjs(),
        }}
      >
        <Card title="بيانات المشروع">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="اسم المشروع"
                rules={[{ required: true, message: "يرجى إدخال اسم المشروع" }]}
              >
                <Input placeholder="أدخل اسم المشروع" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="start_date"
                label="تاريخ البداية"
                rules={[
                  { required: true, message: "يرجى اختيار تاريخ البداية" },
                ]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item className="text-center mt-5">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
          >
            {isEditing ? "تحديث المشروع" : "إضافة المشروع"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProjectForm;
