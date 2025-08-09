import React from "react";
import {
  Form,
  InputNumber,
  Card,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
} from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  MoneyCollectOutlined,
  FieldTimeOutlined,
  DollarOutlined,
  AimOutlined,
  WalletOutlined,
  UserOutlined,
  CalendarTwoTone,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSearchParams } from "react-router";

const { Option } = Select;

const SalaryForm: React.FC = () => {
  const [params] = useSearchParams();

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Submitted salary data:", values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        basicSalary: 10000,
        dailyHours: 8,
        workDays: 26,
        hourlyRate: 48.08,
        overtimeHours: 0,
        deductionHours: 0,
        bonuses: 0,
        vacations: 0,
        employeeId: params.get("employee"),
        salaryMonth: dayjs(),
      }}
      className="space-y-6"
    >
      <Card title="بيانات الراتب" className="shadow-md rounded-xl">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item name="employeeId" label="الموظف:">
              <Select
                placeholder="اختر موظفاً"
                allowClear
                suffixIcon={<UserOutlined />}
                className="lg:max-w-lg lg:w-80"
              >
                <Option value="emp1">محمد أحمد</Option>
                <Option value="emp2">سارة خالد</Option>
                <Option value="emp3">عبدالله حسين</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="salaryMonth" label="شهر الراتب:">
              <DatePicker
                picker="month"
                className="lg:max-w-lg w-full lg:w-80"
                suffixIcon={<CalendarTwoTone />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="basicSalary" label="المرتب الأساسي:">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<MoneyCollectOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="dailyHours" label="ساعات العمل اليومية:">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<ClockCircleOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="workDays" label="أيام العمل في الشهر:">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="hourlyRate" label="الأجر بالساعة:">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<FieldTimeOutlined />}
                readOnly
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="overtimeHours" label="الساعات الإضافية (ساعة):">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<ClockCircleOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="deductionHours" label="الخصومات (ساعة):">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<FieldTimeOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="bonuses" label="المكافآت (مبلغ):">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<DollarOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="vacations" label="الإجازات (يوم):">
              <InputNumber
                className="w-full"
                min={0}
                addonAfter={<AimOutlined />}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="notes" label="ملاحظات:">
              <Input.TextArea
                rows={4}
                placeholder="أدخل أي ملاحظات متعلقة بالراتب ..."
                className="w-full"
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card className="shadow rounded-lg mb-6" title="ملخص الحضور">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">عدد أيام الحضور:</strong>{" "}
              <span className="text-black">24 يوم</span>
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">عدد أيام الغياب:</strong>{" "}
              <span className="text-black">2 يوم</span>
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">إجمالي التأخيرات:</strong>{" "}
              <span className="text-black">45 دقيقة (= 0.75 ساعة)</span>
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">ساعات العمل الفعلية:</strong>{" "}
              <span className="text-black">184 ساعة</span>
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">الساعات الإضافية:</strong>{" "}
              <span className="text-black">6 ساعة</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="shadow rounded-lg mb-4" title="إجماليات">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">إجمالي الخصومات:</strong>{" "}
              <span className="text-black">250 ريال</span>
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800">
              <strong className="me-2">إجمالي الزيادات:</strong>{" "}
              <span className="text-black">600 ريال</span>
            </div>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div className="text-gray-800 font-bold">
              <strong className="me-2">صافي الراتب:</strong>{" "}
              <span className="text-green-700">10,350 ريال</span>
            </div>
          </Col>
        </Row>
      </Card>

      <div className="text-center">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<WalletOutlined />}
        >
          حفظ البيانات
        </Button>
      </div>
    </Form>
  );
};

export default SalaryForm;
