import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Card,
  Space,
  Image,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Employee } from "../../types/employee";
import UploadImage from "@/components/file-handling/UploadImage";
import { useEffect, useState } from "react";
import {
  useEmployeeMutation,
  useGetAllDepartmentsQuery,
} from "@/app/api/endpoints/employees";
import Error from "../Error";
import Loading from "@/components/Loading";
import { calculateAge } from "@/utils";
import UploadFile from "@/components/file-handling/UploadFile";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";
import { handleServerErrors } from "@/utils/handleForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

const { Option } = Select;

type EmployeeFormValues = Omit<Employee, "image" | "cv"> & {
  image?: File | null;
  cv?: File | null;
  birth_date: Dayjs;
  hire_date: Dayjs;
};

const EmployeeForm = ({
  initialValues,
  employeeId,
  onSubmit,
}: {
  initialValues?: Employee;
  employeeId?: string;
  onSubmit?: (values: Employee) => void;
}) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const notification = useNotification();
  const navigate = useNavigate();

  const {
    data: departments,
    isFetching,
    isError,
  } = useGetAllDepartmentsQuery();

  const [
    addEmployee,
    {
      data: empData,
      isLoading: empLoad,
      isError: empIsError,
      isSuccess: empDone,
      error: empError,
    },
  ] = useEmployeeMutation();

  const handleSubmit = (values: EmployeeFormValues) => {
    const data = {
      ...values,
      birth_date: values.birth_date.format("YYYY-MM-DD"),
      hire_date: values.hire_date.format("YYYY-MM-DD"),
    };
    if (image) data.image = image;
    if (cv) data.cv = cv;

    addEmployee({
      data: data as Employee,
      method: initialValues ? "PATCH" : "POST",
      url: employeeId
        ? `/employees/employees/${employeeId}/`
        : "/employees/employees/",
    });
  };

  useEffect(() => {
    if (empIsError) {
      const error = empError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة الموظف!" });
    }
  }, [empIsError]);

  useEffect(() => {
    if (empDone) {
      notification.success({
        message: `تم ${initialValues ? "تعديل بيانات" : "إضافة"} الموظف`,
      });
      navigate(
        `/employees/employee-profile/${
          initialValues ? initialValues.id : empData.id
        }`
      );
    }
  }, [empDone]);

  if (isFetching) return <Loading />;
  if (isError) return <Error />;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {initialValues ? "تعديل" : "إضافة"} موظف
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changed) => {
          if (changed.birth_date) {
            const age = calculateAge(
              dayjs(changed.birth_date).format("YYYY-MM-DD")
            );
            form.setFieldsValue({ age });
          }
        }}
        initialValues={{
          age: calculateAge(dayjs("1970-1-1").format("YYYY-MM-DD")),
          ...initialValues,
          birth_date: initialValues?.birth_date
            ? dayjs(initialValues.birth_date)
            : dayjs(1980 - 1 - 1),
          hire_date: initialValues?.hire_date
            ? dayjs(initialValues.hire_date)
            : dayjs(),
        }}
        className="add-form"
      >
        {/* Personal Details Section */}
        <Card title="البيانات الشخصية" className="mb-16">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="الاسم"
                rules={[{ required: true, message: "يرجى إدخال الاسم" }]}
              >
                <Input placeholder="أدخل الاسم" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label="الجنس"
                rules={[{ required: true, message: "يرجى تحديد الجنس" }]}
              >
                <Select placeholder="اختر الجنس">
                  <Option value="male">ذكر</Option>
                  <Option value="female">أنثى</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="البريد الإلكتروني"
                rules={[
                  { type: "email", message: "البريد الإلكتروني غير صالح" },
                  { required: true, message: "يرجى إدخال البريد الالكتروني" },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="رقم الهاتف"
                rules={[
                  { required: true, message: "يرجى إدخال رقم الهاتف" },
                  {
                    pattern: /^\d+$/,
                    message: "رقم الهاتف يجب أن يحتوي على أرقام فقط",
                  },
                ]}
              >
                <Input placeholder="أدخل رقم الهاتف" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="national_id"
                label="الرقم القومي"
                rules={[
                  { required: true, message: "يرجى إدخال الرقم القومي" },
                  {
                    pattern: /^\d+$/,
                    message: "الرقم القومي يجب أن يحتوي على أرقام فقط",
                  },
                ]}
              >
                <Input placeholder="أدخل الرقم القومي" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="العنوان">
                <Input placeholder="أدخل العنوان" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="birth_date"
                label="تاريخ الميلاد"
                rules={[
                  { required: true, message: "يرجى إدخال تاريخ الميلاد" },
                ]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  className="w-full"
                  placeholder="اختر تاريخ الميلاد"
                  maxDate={dayjs()}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="age" label="العمر">
                <Input type="number" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="marital_status"
                label="الحالة الاجتماعية"
                rules={[
                  { required: true, message: "يرجى تحديد الحالة الاجتماعية" },
                ]}
              >
                <Select placeholder="اختر الحالة الاجتماعية">
                  <Option value="single">أعزب</Option>
                  <Option value="married">متزوج</Option>
                  <Option value="divorced">مطلق</Option>
                  <Option value="widowed">أرمل</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} className="flex gap-6 flex-wrap">
              <Form.Item label="الصورة">
                <UploadImage setFile={setImage} />
              </Form.Item>
              {initialValues && (
                <>
                  {initialValues.image ? (
                    <div className="flex flex-col gap-2">
                      <p className="">الصورة الحالية:</p>
                      <Space size={12} className="rounded">
                        <Image
                          width={100}
                          src={initialValues.image}
                          className="rounded-full"
                          preview={{
                            movable: false,
                            toolbarRender: () => <></>,
                          }}
                        />
                      </Space>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="text-red-600">لا توجد صورة حالية</p>
                    </div>
                  )}
                </>
              )}
            </Col>
            <Col xs={24} md={12} className="flex gap-6 flex-wrap">
              <Form.Item label="السيرة الذاتية">
                <UploadFile setFile={setCv} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Job Details Section */}
        <Card title="التفاصيل الوظيفية" style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="employee_id"
                label="الرقم الوظيفي"
                rules={[
                  { required: true, message: "يرجى إدخال الرقم الوظيفي" },
                ]}
              >
                <Input placeholder="أدخل الرقم الوظيفي" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="position"
                label="المسمى الوظيفي"
                rules={[
                  { required: true, message: "يرجى إدخال المسمى الوظيفي" },
                ]}
              >
                <Input placeholder="أدخل المسمى الوظيفي" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="department"
                label="القسم"
                rules={[{ required: true, message: "يرجى تحديد القسم" }]}
              >
                <Select placeholder="اختر القسم">
                  {departments!.map((dep) => (
                    <Option value={dep.id} key={dep.id}>
                      {dep.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="hire_date"
                label="تاريخ التوظيف"
                rules={[
                  { required: true, message: "يرجى إدخال تاريخ الميلاد" },
                ]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  className="w-full"
                  placeholder="اختر تاريخ التوظيف"
                  maxDate={dayjs()}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="mode"
                label="وضع العمل"
                rules={[{ required: true, message: "يرجى تحديد وضع العمل" }]}
              >
                <Select placeholder="اختر وضع العمل">
                  <Option value="on-site">من المقر</Option>
                  <Option value="remote">عن بُعد</Option>
                  <Option value="hybrid">هجين</Option>
                </Select>
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
            loading={empLoad}
          >
            {initialValues ? "تحديث البيانات" : "إضافة الموظف"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default EmployeeForm;
