import { Form, Input, Select, DatePicker, Button, Row, Col, Card } from "antd";
import dayjs from "dayjs";
import { Project, ProjectFormParams, ProjectFormValues } from "@/types/project";
import { FC, useEffect, useState } from "react";
import { useGetEmployeesQuery } from "@/app/api/endpoints/employees";
import Error from "@/pages/Error";
import Loading from "@/components/Loading";
import { useProjectMutation } from "@/app/api/endpoints/projects";
import { handleServerErrors } from "@/utils/handleForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";

const ProjectForm: FC<ProjectFormParams> = ({
  initialValues,
  projectId,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  const notification = useNotification();
  const navigate = useNavigate();

  const {
    data: employees,
    isLoading,
    isFetching: refetchingEmployees,
    isError: employeesError,
  } = useGetEmployeesQuery({ search: employeeSearch });

  const [
    addProject,
    {
      data: empData,
      isLoading: projectLoad,
      isError: projectIsError,
      isSuccess: projectDone,
      error: projectError,
    },
  ] = useProjectMutation();

  const handleSubmit = (values: ProjectFormValues) => {
    // normalizing form values
    const data = {
      ...values,
      start_date: values.start_date.format("YYYY-MM-DD"),
      end_date: values.end_date?.format("YYYY-MM-DD") || null,
      supervisors: values.supervisors?.map((sup) =>
        typeof sup === "object" ? sup.value : sup
      ),
    };

    addProject({
      data: data as Project,
      method: initialValues ? "PATCH" : "POST",
      url: projectId
        ? `/projects/projects/${projectId}/`
        : "/projects/projects/",
    });
  };

  useEffect(() => {
    if (projectIsError) {
      const error = projectError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة المشروع!" });
    }
  }, [projectIsError]);

  useEffect(() => {
    if (projectDone) {
      notification.success({
        message: `تم ${initialValues ? "تعديل بيانات" : "إضافة"} المشروع`,
      });
      navigate(
        `/projects/project/${initialValues ? initialValues.id : empData.id}`
      );
    }
  }, [projectDone]);

  if (isLoading) return <Loading />;
  if (employeesError) return <Error />;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {initialValues ? "تعديل" : "إضافة"} مشروع
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ...initialValues,
          start_date: initialValues?.start_date
            ? dayjs(initialValues.start_date)
            : dayjs(),
          end_date: initialValues?.end_date
            ? dayjs(initialValues.end_date)
            : null,
          supervisors: initialValues?.current_supervisors?.map((sup) => ({
            value: sup.id,
            label: (
              <span>
                {sup.name}
                {!sup.is_active && " (غير نشط)"}
              </span>
            ),
          })),
        }}
        className="add-form"
      >
        {/* General Information Section */}
        <Card title="المعلومات العامة" className="mb-16">
          <Row gutter={[16, 16]}>
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
                name="client"
                label="العميل"
                rules={[{ required: true, message: "يرجى إدخال اسم العميل" }]}
              >
                <Input placeholder="أدخل اسم العميل" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="budget"
                label="الميزانية"
                rules={[{ required: true, message: "يرجى إدخال الميزانية" }]}
              >
                <Input type="number" placeholder="أدخل الميزانية (اختياري)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item name="description" label="وصف المشروع">
                <Input.TextArea
                  rows={3}
                  placeholder="أدخل وصف المشروع (اختياري)"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Project Details Section */}
        <Card title="تفاصيل المشروع" style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="start_date"
                label="تاريخ الاستلام"
                rules={[
                  { required: true, message: "يرجى اختيار تاريخ الاستلام" },
                ]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="end_date" label="تاريخ الانتهاء">
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="supervisors" label="المشرفون">
                <Select
                  mode="multiple"
                  placeholder="اختر المشرفين"
                  allowClear
                  loading={refetchingEmployees}
                  onSearch={(value) => {
                    setEmployeeSearch(value);
                  }}
                  searchValue={employeeSearch}
                  options={employees?.data.map((emp) => ({
                    label: (
                      <span>
                        {emp.name}
                        {!emp.is_active && " (غير نشط)"}
                      </span>
                    ),
                    value: emp.id,
                  }))}
                  filterOption={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Submit Button */}
        <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={projectLoad}
          >
            {initialValues ? "تعديل المشروع" : "إضافة المشروع"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProjectForm;
