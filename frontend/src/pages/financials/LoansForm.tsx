import {
  Form,
  Input,
  DatePicker,
  Button,
  Card,
  InputNumber,
  Col,
  Row,
  Statistic,
  Select,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { handleServerErrors } from "@/utils/handleForm";
import { useLoanMutation } from "@/app/api/endpoints/loans";
import { Loan } from "@/types/loan";
import { useGetClientsQuery } from "@/app/api/endpoints/clients";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { Client } from "@/types/client";

const { TextArea } = Input;

type LoanFormProps = {
  onSubmit?: (values: Loan) => void;
  initialValues?: Partial<Loan> & { editable?: boolean };
};

const LoanForm = ({ onSubmit, initialValues }: LoanFormProps) => {
  const [form] = Form.useForm();
  const notification = useNotification();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  const [amount, setAmount] = useState<number>(initialValues?.amount ?? 0);
  const [repaymentsCount, setRepaymentsCount] = useState<number>(
    // default at least 1 to avoid NaN
    // initialValues?.repayments_count ?? 1
    1
  );

  const {
    data: clientsData,
    isFetching,
    isError,
  } = useGetClientsQuery({
    no_pagination: false,
    serializer: "select",
    search,
    page: 1,
  });

  const clientsArray = Array.isArray(clientsData)
    ? clientsData
    : clientsData?.data ?? [];

  const [
    handleLoan,
    {
      data: loan,
      isLoading: loanLoading,
      isError: loanIsError,
      error: loanError,
      isSuccess: loanDone,
    },
  ] = useLoanMutation();

  const onFinish = (values: any) => {
    const data = {
      ...values,
      issued_date: values.issued_date.format("YYYY-MM-DD"),
      payment_date: values.payment_date.format("YYYY-MM-DD"),
    };

    handleLoan({
      data,
      url: initialValues
        ? `/financials/loans/${initialValues.id}/`
        : "/financials/loans/",
      method: initialValues ? "PATCH" : "POST",
    });
  };

  useEffect(() => {
    if (loanIsError) {
      const error = loanError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }
      notification.error({ message: "خطأ في إضافة القرض!" });
    }
  }, [loanIsError]);

  useEffect(() => {
    if (isError) {
      notification.error({ message: "خطأ في الحصول على بيانات العملاء!" });
    }
  }, [isError]);

  useEffect(() => {
    if (loanDone) {
      notification.success({
        message: `تم ${initialValues ? "تعديل بيانات" : "إضافة"} القرض`,
      });
      navigate(
        `/financials/loans/${initialValues ? initialValues.id : loan.id}`
      );
    }
  }, [loanDone]);

  const isEditing = Boolean(initialValues);

  const repaymentAmount =
    repaymentsCount > 0 ? (amount / repaymentsCount).toFixed(2) : "0.00";

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-right">
        {isEditing ? "تعديل" : "إضافة"} قرض
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...initialValues,
          issued_date: initialValues?.issued_date
            ? dayjs(initialValues.issued_date)
            : dayjs(),
          payment_date: dayjs().add(1, "month"),
        }}
      >
        <Card title="بيانات القرض">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="client"
                label={
                  <div className="flex gap-2 items-center">
                    <span>اختر العميل</span>
                    {isFetching && (
                      <Spin size="small" indicator={<LoadingOutlined spin />} />
                    )}
                  </div>
                }
                rules={[{ required: true, message: "يرجى اختيار العميل" }]}
              >
                <Select
                  placeholder="اختر العميل"
                  showSearch
                  filterOption={false}
                  onSearch={(value) => setSearch(value)}
                >
                  {clientsArray.map((client) => (
                    <Select.Option key={client.id} value={client.id}>
                      {client.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="amount"
                label="المبلغ"
                rules={[{ required: true, message: "يرجى إدخال المبلغ" }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="أدخل المبلغ"
                  min={1}
                  onChange={(value) => setAmount(value ?? 0)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="repayments_count"
                label="عدد الأقساط"
                rules={[{ required: true, message: "يرجى إدخال عدد الأقساط" }]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  onChange={(value) => setRepaymentsCount(value ?? 1)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Statistic
                title="قيمة القسط الواحد"
                value={repaymentAmount}
                suffix="ج.م"
                valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                className="mb-3"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="issued_date"
                label="تاريخ الإصدار"
                rules={[{ required: true, message: "يرجى اختيار التاريخ" }]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="payment_date"
                label="تاريخ بداية السداد"
                rules={[
                  { required: true, message: "يرجى اختيار تاريخ بداية السداد" },
                ]}
              >
                <DatePicker
                  picker="month"
                  format="YYYY-MM"
                  className="w-full"
                  placeholder="اختر الشهر"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="notes" label="الملاحظات">
                <TextArea rows={3} placeholder="أدخل ملاحظات القرض (اختياري)" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item className="text-center mt-5">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loanLoading}
          >
            {isEditing ? "تحديث القرض" : "إضافة قرض"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoanForm;
