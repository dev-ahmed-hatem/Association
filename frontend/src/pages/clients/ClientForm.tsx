import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Card,
  Alert,
  InputNumber,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { calculateAge, extractBirthdateFromNationalId } from "@/utils";
import { Client, rankValues } from "@/types/client";
import { useGetWorkEntitiesQuery } from "@/app/api/endpoints/workentities";
import ErrorPage from "../Error";
import Loading from "@/components/Loading";
import { useClientMutation } from "@/app/api/endpoints/clients";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { handleServerErrors } from "@/utils/handleForm";
import { useEffect, useState } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";

const { Option } = Select;

type ClientFormValues = Omit<
  Client,
  "birth_date" | "hire_date" | "subscription_date"
> & {
  birth_date: Dayjs;
  hire_date: Dayjs;
  subscription_date: Dayjs;
};

const ClientForm = ({
  initialValues,
  client_id,
}: {
  initialValues?: Client;
  client_id?: string;
}) => {
  const [form] = Form.useForm<ClientFormValues>();
  const notification = useNotification();
  const navigate = useNavigate();

  const [age, setAge] = useState("");

  // payment states
  const [paymentMethod, setPaymentMethod] = useState<string>("نقدي");
  const [subscriptionFee, setSubscriptionFee] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const remaining =
    subscriptionFee > paidAmount ? subscriptionFee - paidAmount : 0;

  const {
    data: workentites,
    isFetching: loadingEntities,
    isError: entitiesError,
  } = useGetWorkEntitiesQuery({ no_pagination: true });
  const [
    addClient,
    { data: client, isSuccess, isLoading, isError, error: clientError },
  ] = useClientMutation();

  const handleSubmit = (values: ClientFormValues) => {
    const data = {
      ...values,
      birth_date: values.birth_date.format("YYYY-MM-DD"),
      hire_date: values.hire_date.format("YYYY-MM-DD"),
      subscription_date: values.subscription_date.format("YYYY-MM-DD"),
    };

    addClient({
      data: data as Client,
      method: initialValues ? "PATCH" : "POST",
      url: client_id ? `/clients/clients/${client_id}/` : "/clients/clients/",
    });
  };

  useEffect(() => {
    if (isError) {
      const error = clientError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة العضو!" });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: `تم ${initialValues ? "تحديث بيانات" : "إضافة"} العضو`,
      });
      navigate(
        `/clients/client-profile/${
          initialValues ? initialValues.id : client.id
        }`
      );
    }
  }, [isSuccess]);

  if (loadingEntities) return <Loading />;
  if (entitiesError) return <ErrorPage />;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {initialValues ? "تحديث بيانات" : "إضافة"} عضو
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changed) => {
          if (changed.national_id) {
            const birth_date = extractBirthdateFromNationalId(
              changed.national_id
            );
            if (birth_date) {
              form.setFieldsValue({
                birth_date: birth_date,
              });
              setAge(calculateAge(birth_date.format("YYYY-MM-DD")));
            } else {
              form.setFieldsValue({
                birth_date: undefined,
                age: undefined,
              });
            }
          }
        }}
        initialValues={{
          ...initialValues,
          birth_date: initialValues?.birth_date
            ? dayjs(initialValues.birth_date)
            : null,
          hire_date: initialValues?.hire_date
            ? dayjs(initialValues.hire_date)
            : null,
          subscription_date: initialValues?.subscription_date
            ? dayjs(initialValues.subscription_date)
            : dayjs(),
        }}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
      >
        {/* Personal Info */}
        <Card title="البيانات الشخصية" className="mb-6">
          <Row gutter={16}>
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
                name="national_id"
                label="الرقم القومي"
                rules={[
                  { required: true, message: "يرجى إدخال الرقم القومي" },
                  {
                    pattern: /^\d{14}$/,
                    message: "الرقم القومي يجب أن يتكون من 14 رقمًا",
                  },
                ]}
              >
                <Input placeholder="أدخل الرقم القومي" maxLength={14} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
                  disabled
                  placeholder="يحسب تلقائيا"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="العمر">
                <Input value={age} disabled placeholder="يحسب تلقائيا" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone_number"
                label="رقم الهاتف"
                rules={[
                  { required: true, message: "يرجى إدخال رقم الهاتف" },
                  {
                    pattern: /^01[0-9]{9}$/,
                    message:
                      "رقم الموبايل يجب أن يبدأ بـ 01 ويتكون من 11 رقمًا",
                  },
                ]}
              >
                <Input
                  placeholder="أدخل رقم الهاتف"
                  allowClear
                  maxLength={11}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="marital_status"
                label="الحالة الاجتماعية"
                rules={[
                  { required: true, message: "يرجى تحديد الحالة الاجتماعية" },
                ]}
              >
                <Select placeholder="اختر الحالة">
                  <Option value="أعزب">أعزب</Option>
                  <Option value="متزوج">متزوج</Option>
                  <Option value="مطلق">مطلق</Option>
                  <Option value="أرمل">أرمل</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Education */}
        <Card title="البيانات التعليمية" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="graduation_year"
                label="سنة التخرج"
                rules={[
                  { required: true, message: "يرجى إدخال سنة التخرج" },
                  { pattern: /^\d{4}$/, message: "أدخل سنة صحيحة" },
                ]}
              >
                <Select placeholder="اختر سنة التخرج" allowClear showSearch>
                  {Array.from(
                    { length: new Date().getFullYear() - 1980 + 1 },
                    (_, i) => 1980 + i
                  ).map((year) => (
                    <Select.Option key={year} value={year}>
                      {year}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="class_rank"
                label="الترتيب على الدفعة"
                rules={[
                  { required: true, message: "يرجى إدخال الترتيب" },
                  {
                    pattern: /^(?:[1-9][0-9]{0,4}|100000)$/,
                    message: "أدخل رقم صحيح من 1 إلى 100000",
                  },
                ]}
              >
                <Input
                  placeholder="أدخل الترتيب"
                  type="number"
                  min={1}
                  max={100000}
                  maxLength={6}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Work Details */}
        <Card title="البيانات الوظيفية" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="rank"
                label="الرتبة"
                rules={[{ required: true, message: "يرجى إدخال الرتبة" }]}
              >
                <Select placeholder="اختر الرتبة">
                  {rankValues.map((option) => (
                    <Select.Option key={option} value={option}>
                      {option}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="work_entity"
                label="جهة العمل"
                rules={[{ required: true, message: "يرجى إدخال جهة العمل" }]}
              >
                <Select placeholder="اختر الجهة">
                  {workentites?.map((entity) => (
                    <Option value={entity.id} key={entity.id}>
                      {entity.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="hire_date"
                label="تاريخ التعيين"
                rules={[
                  { required: true, message: "يرجى إدخال تاريخ التعيين" },
                ]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="membership_number"
                label="رقم العضوية"
                rules={[
                  { required: true, message: "يرجى إدخال رقم العضوية" },
                  {
                    pattern: /^[1-9][0-9]*$/,
                    message: "أدخل رقم صحيح أكبر من أو يساوي 1",
                  },
                ]}
              >
                <Input placeholder="أدخل رقم العضوية" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="membership_type"
                label="نوع العضوية"
                rules={[{ required: true, message: "يرجى تحديد نوع العضوية" }]}
              >
                <Select placeholder="اختر نوع العضوية">
                  <Option value="مؤسس">مؤسس</Option>
                  <Option value="عامل">عامل</Option>
                  <Option value="منضم">منضم</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="subscription_date"
                label="تاريخ الاشتراك"
                rules={[
                  { required: true, message: "يرجى إدخال تاريخ الاشتراك" },
                ]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="الدفع" className="mb-6">
          <Row gutter={16}>
            {/* Subscription Fee */}
            <Col xs={24} md={12}>
              <Form.Item
                name="subscription_fee"
                label="رسوم الاشتراك"
                rules={[
                  { required: true, message: "يرجى إدخال رسوم الاشتراك" },
                ]}
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  onChange={(value) => setSubscriptionFee(value || 0)}
                />
              </Form.Item>
            </Col>

            {/* Payment Method */}
            <Col xs={24} md={12}>
              <Form.Item
                name="payment_method"
                label="نظام الدفع"
                rules={[{ required: true, message: "يرجى اختيار نظام الدفع" }]}
              >
                <Select
                  placeholder="اختر نظام الدفع"
                  onChange={(value) => setPaymentMethod(value)}
                >
                  <Option value="نقدي">نقدي</Option>
                  <Option value="ايصال بنكي">ايصال بنكي</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Bank Receipt Fields */}
          {paymentMethod === "ايصال بنكي" && (
            <>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="bank"
                    label="البنك"
                    rules={[{ required: true, message: "يرجى إدخال" }]}
                  >
                    <Select placeholder="اختر البنك">
                      <Option value="bank1">البنك الأول</Option>
                      <Option value="bank2">البنك الثاني</Option>
                      <Option value="bank3">البنك الثالث</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="receipt_number"
                    label="رقم الإيصال"
                    rules={[
                      { required: true, message: "يرجى إدخال رقم الإيصال" },
                    ]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="paid_amount"
                label="المدفوع"
                rules={[
                  { required: true, message: "يرجى إدخال المبلغ المدفوع" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={subscriptionFee}
                  className="w-full"
                  onChange={(value) => setPaidAmount(value || 0)}
                  disabled={subscriptionFee == 0 || !subscriptionFee}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Remaining Amount & Installments */}
          {remaining > 0 && (
            <Row gutter={16} className="flex items-center">
              <Col xs={24} md={12}>
                <div className="flex items-center ps-4 bg-yellow-50 border border-yellow-300 rounded h-[34px]">
                  المبلغ المتبقي: <strong className="ms-2">{remaining}</strong>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="installments_count"
                  label="عدد الأقساط"
                  rules={[
                    { required: true, message: "يرجى إدخال عدد الأقساط" },
                  ]}
                >
                  <InputNumber min={1} className="w-full" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>

        {(clientError as axiosBaseQueryError)?.data?.non_field_errors?.length >
          0 && (
          <div className="w-full mb-4 px-2 sm:px-0">
            <Alert
              message="قيم غير صالحة:"
              description={
                <ul className="list-disc list-inside space-y-1">
                  {(
                    clientError as axiosBaseQueryError
                  )?.data?.non_field_errors.map(
                    (error: string, index: number) => (
                      <li key={index} className="break-words">
                        {error}
                      </li>
                    )
                  )}
                </ul>
              }
              type="error"
              showIcon
              className="rounded-lg shadow-sm"
            />
          </div>
        )}

        <Form.Item style={{ textAlign: "center" }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="min-w-28"
            loading={isLoading}
          >
            {initialValues ? "تحديث البيانات" : "إضافة"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ClientForm;
