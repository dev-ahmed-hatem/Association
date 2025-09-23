import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Spin,
  InputNumber,
  Col,
  Row,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  expensePaymentMethods,
  FinancialRecord,
  incomePaymentMethods,
  PaymentMethod,
  receiptPaymentMethods,
} from "@/types/financial_record";
import { useEffect, useState } from "react";
import { useGetTransactionTypesQuery } from "@/app/api/endpoints/transaction_types";
import { TransactionKindArabic } from "@/types/transaction_type";
import Loading from "@/components/Loading";
import ErrorPage from "../Error";
import { useLazyGetBankAccountsQuery } from "@/app/api/endpoints/bank_accounts";
import { useFinancialRecordMutation } from "@/app/api/endpoints/financial_records";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { handleServerErrors } from "@/utils/handleForm";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";
import { usePermission } from "@/providers/PermissionProvider";

const { Option } = Select;

type FinancialFormProps = {
  onSubmit?: (values: FinancialRecord) => void;
  initialValues?: Partial<FinancialRecord> & { editable?: boolean };
  financialType: "income" | "expense";
};

const FinancialForm = ({
  onSubmit,
  initialValues,
  financialType,
}: FinancialFormProps) => {
  const { can } = usePermission();
  const [form] = Form.useForm();
  const notification = useNotification();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialValues?.payment_method ?? "نقدي"
  );

  const {
    data: transactionTypes,
    isFetching: fetchingTypes,
    isError: typesError,
  } = useGetTransactionTypesQuery({
    no_pagination: true,
    type: TransactionKindArabic[financialType],
  });

  const [
    getAccounts,
    { data: accounts, isFetching: fetchingAccounts, isError: accountsError },
  ] = useLazyGetBankAccountsQuery();

  const [
    handleRecord,
    {
      data: record,
      isLoading: recordLoading,
      isError: recordIsError,
      error: recordError,
      isSuccess: recordDone,
    },
  ] = useFinancialRecordMutation();

  const onFinish = (values: any) => {
    const data = {
      bank_account: null,
      receipt_number: null,
      ...values,
      date: values.date.format("YYYY-MM-DD"),
    };

    handleRecord({
      data,
      url: initialValues
        ? `/financials/financial-records/${initialValues.id}/`
        : "/financials/financial-records/",
      method: initialValues ? "PATCH" : "POST",
    });
  };

  useEffect(() => {
    if (recordIsError) {
      const error = recordError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة العملية المالية!" });
    }
  }, [recordIsError]);

  useEffect(() => {
    if (recordDone) {
      notification.success({
        message: `تم ${
          initialValues ? "تعديل بيانات" : "إضافة"
        } العملية المالية`,
      });
      navigate(
        `/financials/${financialType}s/${
          initialValues ? initialValues.id : record.id
        }`
      );
    }
  }, [recordDone]);

  useEffect(() => {
    if (receiptPaymentMethods.includes(paymentMethod)) {
      getAccounts({
        no_pagination: true,
      });
    }
  }, [paymentMethod]);

  const isEditing = Boolean(initialValues);

  if (fetchingTypes) return <Loading />;
  if (typesError) return <ErrorPage />;
  if (initialValues && !initialValues.editable)
    return (
      <ErrorPage
        title="لا يمكن تعديل العملية"
        subtitle="هذه العملية تم إنشاؤها بواسطة النظام ، وبالتالي لا يمكن تعديلها."
        reload={false}
      />
    );

  if (
    (financialType === "income" && !can("incomes.add")) ||
    (financialType === "expense" && !can("expenses.add"))
  )
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-right">
        {isEditing ? "تعديل" : "إضافة"}{" "}
        {financialType === "income" ? "إيراد" : "مصروف"}
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
        }}
      >
        <Card title="بيانات العملية المالية">
          <Row gutter={16}>
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
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="transaction_type"
                label="الفئة"
                rules={[{ required: true, message: "يرجى اختيار الفئة" }]}
              >
                <Select placeholder="اختر فئة">
                  {transactionTypes!.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="date"
                label="التاريخ"
                rules={[{ required: true, message: "يرجى اختيار التاريخ" }]}
              >
                <DatePicker format="YYYY-MM-DD" className="w-full" />
              </Form.Item>
            </Col>

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
                  {financialType === "income"
                    ? incomePaymentMethods.map((method, idx) => (
                        <Option value={method} key={idx}>
                          {method}
                        </Option>
                      ))
                    : expensePaymentMethods.map((method, idx) => (
                        <Option value={method} key={idx}>
                          {method}
                        </Option>
                      ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {receiptPaymentMethods.includes(paymentMethod) && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bank_account"
                  label={
                    <div className="flex gap-2 items-center">
                      <span>البنك</span>
                      {fetchingAccounts && (
                        <Spin
                          size="small"
                          indicator={<LoadingOutlined spin />}
                        />
                      )}
                    </div>
                  }
                  rules={[{ required: true, message: "يرجى إدخال البنك" }]}
                >
                  <Select placeholder="اختر البنك">
                    {accounts?.map((account) => (
                      <Option key={account.id} value={account.id}>
                        {account.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="receipt_number"
                  label={paymentMethod === "شيك" ? "رقم الشيك" : "رقم الإيصال"}
                  rules={[
                    {
                      required: true,
                      message: `يرجى إدخال ${
                        paymentMethod === "شيك" ? "رقم الشيك" : "رقم الإيصال"
                      }`,
                    },
                  ]}
                >
                  <Input className="w-full" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="notes" label="الملاحظات">
                <Input.TextArea
                  rows={3}
                  placeholder={`أدخل ملاحظات ${
                    financialType === "income" ? "الإيراد" : "المصروف"
                  } (اختياري)`}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item className="text-center mt-5">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={recordLoading}
          >
            {isEditing
              ? `تحديث ${financialType === "income" ? "الإيراد" : "المصروف"}`
              : `إضافة ${financialType === "income" ? "إيراد" : "مصروف"}`}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default FinancialForm;
