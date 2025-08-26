import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  Col,
  Row,
  Spin,
} from "antd";
import {
  BankOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useLazyGetBankAccountsQuery } from "@/app/api/endpoints/bank_accounts";
import { PaymentMethod } from "@/types/financial_record";
import { ProjectTransaction } from "@/types/project_transaction";
import dayjs from "dayjs";
import { useProjectTransactionMutation } from "@/app/api/endpoints/project_transactions.ts";
import { useNotification } from "@/providers/NotificationProvider";

const { Option } = Select;

type TransactionModalProps = {
  type: "income" | "expense";
  initialValues?: ProjectTransaction;
  project_id: string;
};

const ProjectTransactionModal = ({
  type,
  initialValues,
  project_id,
}: TransactionModalProps) => {
  const notification = useNotification();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialValues?.payment_method ?? "نقدي"
  );

  const [
    handleTransaction,
    {
      data: transaction,
      isLoading: loading,
      isError: transactionIsError,
      isSuccess,
    },
  ] = useProjectTransactionMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        project: project_id,
        transaction_type: type,
      };

      handleTransaction({ data, method: "POST" });
    } catch {}
  };

  useEffect(() => {
    if (transactionIsError) {
      notification.error({
        message: `حدث خطأ أثناء إضافة ${
          type === "income" ? "الإيراد" : "المصروف"
        }  ! برجاء إعادة المحاولة`,
      });
    }
  }, [transactionIsError]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: `تم إضافة ${type === "income" ? "الإيراد" : "المصروف"} `,
      });
    }
  }, [isSuccess]);

  const [getAccounts, { data: accounts, isFetching: fetchingAccounts }] =
    useLazyGetBankAccountsQuery();

  useEffect(() => {
    if (paymentMethod == "إيصال بنكي") {
      getAccounts({
        no_pagination: true,
      });
    }
  }, [paymentMethod]);

  return (
    <>
      <Button
        type="primary"
        icon={type === "income" ? <FileTextOutlined /> : <BankOutlined />}
        onClick={() => setOpen(true)}
      >
        {type === "income" ? "إضافة إيراد" : "إضافة مصروف"}
      </Button>

      <Modal
        title={type === "income" ? "إضافة إيراد" : "إضافة مصروف"}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        okText="حفظ"
        okButtonProps={{ loading: loading }}
        cancelText="إلغاء"
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            ...initialValues,
            date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
          }}
        >
          <Form.Item
            label="البيان"
            name="statement"
            rules={[{ required: true, message: "يرجى إدخال البيان" }]}
          >
            <Input placeholder="أدخل البيان" />
          </Form.Item>

          <Card title="بيانات العملية المالية">
            <Row gutter={16}>
              <Col xs={24} md={24}>
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
                  rules={[
                    { required: true, message: "يرجى اختيار نظام الدفع" },
                  ]}
                >
                  <Select
                    placeholder="اختر نظام الدفع"
                    onChange={(value) => setPaymentMethod(value)}
                  >
                    <Option value="نقدي">نقدي</Option>
                    <Option value="إيصال بنكي">إيصال بنكي</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {paymentMethod === "إيصال بنكي" && (
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
                    label="رقم الإيصال"
                    rules={[
                      { required: true, message: "يرجى إدخال رقم الإيصال" },
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
                      type === "income" ? "الإيراد" : "المصروف"
                    } (اختياري)`}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    </>
  );
};

export default ProjectTransactionModal;
