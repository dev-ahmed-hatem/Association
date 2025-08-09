import { Form, Input, DatePicker, Button, Row, Col, Card } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;

type Note = {
  title: string;
  body: string;
  date: string;
  addedBy: string;
};

const AddNote = ({
  initialValues,
  onSubmit,
}: {
  initialValues?: Note;
  onSubmit?: (values: Note) => void;
}) => {
  const [form] = Form.useForm();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        {initialValues ? "تعديل" : "إضافة"} ملاحظة
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          const formatted = {
            ...values,
            date: values.date.format("YYYY-MM-DD"),
          };
          onSubmit?.(formatted as Note);
        }}
        initialValues={{
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
        }}
        className="add-form"
      >
        <Card title="تفاصيل الملاحظة" className="mb-16">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="title"
                label="عنوان الملاحظة"
                rules={[{ required: true, message: "يرجى إدخال عنوان" }]}
              >
                <Input placeholder="عنوان مختصر" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="body"
                label="تفاصيل الملاحظة"
                rules={[{ required: true, message: "يرجى كتابة الملاحظة" }]}
              >
                <TextArea rows={5} placeholder="نص الملاحظة الكامل" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" size="large">
            {initialValues ? "تحديث الملاحظة" : "إضافة الملاحظة"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AddNote;
