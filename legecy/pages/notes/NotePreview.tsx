import { Card, Typography, Tooltip, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Paragraph, Text } = Typography;

type Note = {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
};

const exampleNote: Note = {
  id: "1",
  title: "ملاحظة حول الاجتماع القادم",
  body: `هذا تذكير بخصوص الاجتماع القادم مع فريق التقنية. يرجى تجهيز عرض مفصل عن التقدم في المشروع الحالي بالإضافة إلى التحديات التي تواجه الفريق.
  سنركز بشكل خاص على الأداء خلال الربع الأخير والخطط المستقبلية. الحضور إجباري لجميع أعضاء الفريق.`,
  date: "2025-04-15",
  author: "أحمد علي",
};

const NotePreview: React.FC<{ note?: Note; onBack?: () => void }> = ({
  note = exampleNote,
  onBack,
}) => {
  return (
    <>
      <Card
        className="shadow rounded-2xl border-none bg-white"
        title={note.title}
        extra={
          <div className="flex gap-4 text-lg">
            <Tooltip title="تعديل">
              <EditOutlined onClick={() => {}} />
            </Tooltip>
            <Popconfirm
              title="هل أنت متأكد من حذف هذه الملاحظة؟"
              onConfirm={() => {}}
              okText="نعم"
              cancelText="لا"
            >
              <Tooltip title="حذف">
                <DeleteOutlined className="text-red-500" />
              </Tooltip>
            </Popconfirm>
          </div>
        }
      >
        <div className="flex justify-between text-sm text-gray-500 mb-8">
          <Text>تاريخ الإضافة: {dayjs(note.date).format("YYYY/MM/DD")}</Text>
          <Text>بواسطة: {note.author}</Text>
        </div>

        <Paragraph className="leading-loose whitespace-pre-line text-gray-700">
          {note.body}
        </Paragraph>
      </Card>
    </>
  );
};

export default NotePreview;
