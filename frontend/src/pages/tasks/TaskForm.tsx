import { Form, Input, Select, DatePicker, Button, Row, Col, Card } from "antd";
import dayjs from "dayjs";
import { Task, TaskFormParams, TaskFormValues } from "@/types/task";
import { useLocation, useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "../Error";
import { FC, useEffect, useState } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import {
  useGetAllDepartmentsQuery,
  useGetEmployeesQuery,
} from "@/app/api/endpoints/employees";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useTaskMutation } from "@/app/api/endpoints/tasks";
import { handleServerErrors } from "@/utils/handleForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

const { Option } = Select;

const TaskForm: FC<TaskFormParams> = ({ initialValues, taskId, onSubmit }) => {
  const [form] = Form.useForm();

  // check a selected project for the new task
  const location = useLocation();
  const project = location.state;

  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  const [projectSearch, setProjectSearch] = useState<string>("");
  const notification = useNotification();
  const navigate = useNavigate();

  const {
    data: employees,
    isLoading: gettingEmployees,
    isFetching: refetchingEmployees,
    isError: employeesError,
  } = useGetEmployeesQuery({ search: employeeSearch });

  const {
    data: projects,
    isLoading: gettingProjects,
    isFetching: refetchingProjects,
    isError: projectsError,
  } = useGetProjectsQuery({ search: projectSearch });

  const {
    data: departments,
    isLoading: gettingDepartments,
    isError: departmentsError,
  } = useGetAllDepartmentsQuery();

  // handle form data submission
  const [
    addTask,
    {
      data: taskData,
      isLoading: taskLoad,
      isError: taskIsError,
      isSuccess: taskDone,
      error: taskError,
    },
  ] = useTaskMutation();

  const handleSubmit = (values: TaskFormValues) => {
    // normalizing form values
    const data = {
      ...values,
      due_date: values.due_date.format("YYYY-MM-DD"),
      assigned_to: values.assigned_to?.map((emp) =>
        typeof emp === "object" ? emp.value : emp
      ),
      project:
        typeof values.project === "object"
          ? values.project?.value
          : values.project,
    };

    addTask({
      data: data as Task,
      method: initialValues ? "PATCH" : "POST",
      url: taskId ? `/projects/tasks/${taskId}/` : "/projects/tasks/",
    });
  };

  useEffect(() => {
    if (taskIsError) {
      const error = taskError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة المهمة!" });
    }
  }, [taskIsError]);

  useEffect(() => {
    if (taskDone) {
      notification.success({
        message: `تم ${initialValues ? "تعديل بيانات" : "إضافة"} المهمة`,
      });
      navigate(`/tasks/task/${initialValues ? initialValues.id : taskData.id}`);
    }
  }, [taskDone]);

  if (gettingEmployees || gettingProjects || gettingDepartments)
    return <Loading />;
  if (employeesError || projectsError || departmentsError) return <ErrorPage />;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {initialValues ? "تعديل" : "إضافة"} مهمة
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ...initialValues,
          due_date: initialValues?.due_date
            ? dayjs(initialValues.due_date)
            : null,
          assigned_to: initialValues?.currently_assigned?.map((emp) => ({
            label: (
              <span>
                {emp.name}
                {!emp.is_active && " (غير نشط)"}
              </span>
            ),
            value: emp.id,
          })),
          project: project
            ? // initially set the project if passed
              { label: project.name, value: project.id }
            : initialValues?.current_project
            ? // normalize the current project in the edit form values
              {
                label: initialValues.current_project.name,
                value: initialValues.current_project.id,
              }
            : null,
        }}
        className="add-form"
      >
        {/* General Task Details */}
        <Card title="تفاصيل المهمة" className="mb-16">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="اسم المهمة"
                rules={[{ required: true, message: "يرجى إدخال اسم المهمة" }]}
              >
                <Input placeholder="أدخل اسم المهمة" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="departments"
                label="الأقسام"
                rules={[{ required: true, message: "يرجى الأقسام المسؤولة" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="الأقسام المسؤولة عن المهمة"
                  allowClear
                  options={departments?.map((dep) => ({
                    label: dep.name,
                    value: dep.id,
                  }))}
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item name="description" label="وصف المهمة">
                <Input.TextArea
                  rows={3}
                  placeholder="أدخل وصف المهمة (اختياري)"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Task Assignment Details */}
        <Card title="إعدادات المهمة" className="mb-16">
          <Row gutter={[16, 16]}>
            {/* Project Selection (Optional) */}
            <Col xs={24} md={12}>
              <Form.Item name="project" label="المشروع (اختياري)">
                <Select
                  showSearch
                  placeholder="اختر المشروع"
                  disabled={!!project} // Disable if a project is passed
                  allowClear={!project}
                  loading={refetchingProjects}
                  onSearch={(value) => {
                    setProjectSearch(value);
                  }}
                  searchValue={projectSearch}
                  options={projects?.data.map((project) => ({
                    label: project.name,
                    value: project.id,
                  }))}
                  filterOption={false}
                />
              </Form.Item>
            </Col>

            {/* Assigned Person */}
            <Col xs={24} md={12}>
              <Form.Item
                name="assigned_to"
                label="فريق العمل"
                rules={[{ required: true, message: "يرجى اختيار فريق العمل" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="اختر فريق العمل"
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

          <Row gutter={[16, 16]}>
            {/* Task Priority */}
            <Col xs={24} md={12}>
              <Form.Item
                name="priority"
                label="أولوية المهمة"
                rules={[{ required: true, message: "يرجى اختيار الأولوية" }]}
              >
                <Select placeholder="اختر الأولوية">
                  <Option value="high">مرتفع</Option>
                  <Option value="medium">متوسط</Option>
                  <Option value="low">منخفض</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Task Due Date */}
            <Col xs={24} md={12}>
              <Form.Item
                name="due_date"
                label="تاريخ الاستحقاق"
                rules={[
                  { required: true, message: "يرجى اختيار تاريخ الاستحقاق" },
                ]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  className="w-full"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
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
            loading={taskLoad}
          >
            {initialValues ? "تعديل المهمة" : "إضافة المهمة"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TaskForm;
