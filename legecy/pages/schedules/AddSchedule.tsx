import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Card,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import type { Schedule } from "../../types/schedule";

const { Option } = Select;

const AddSchedule = ({
  initialValues,
  onSubmit,
}: {
  initialValues?: Schedule;
  onSubmit?: (values: Schedule) => void;
}) => {
  const [form] = Form.useForm();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {initialValues ? "تعديل" : "إضافة"} جدول
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
          startTime: initialValues?.startTime
            ? dayjs(initialValues.startTime, "HH:mm")
            : null,
          endTime: initialValues?.endTime
            ? dayjs(initialValues.endTime, "HH:mm")
            : null,
        }}
        className="add-form"
      >
        {/* Schedule Info Section */}
        <Card title="تفاصيل الجدول" className="mb-16">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="عنوان الجدول"
                rules={[{ required: true, message: "يرجى إدخال عنوان الجدول" }]}
              >
                <Input placeholder="مثال: دوام صباحي" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="نوع الجدول"
                rules={[{ required: true, message: "يرجى تحديد نوع الجدول" }]}
              >
                <Select placeholder="اختر النوع">
                  <Option value="allDay">طوال اليوم</Option>
                  <Option value="specificTime">وقت محدد</Option>
                  <Option value="period">فترة خلال اليوم</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="date"
                label="التاريخ"
                rules={[{ required: true, message: "يرجى اختيار التاريخ" }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="description" label="الوصف">
                <Input.TextArea
                  placeholder="تفاصيل إضافية عن الجدول"
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Optional Time Selection */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="startTime" label="من الساعة">
                <TimePicker className="w-full" format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="endTime" label="إلى الساعة">
                <TimePicker className="w-full" format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Submit */}
        <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
          <Button type="primary" htmlType="submit" size="large">
            {initialValues ? "تحديث الجدول" : "إضافة الجدول"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AddSchedule;
