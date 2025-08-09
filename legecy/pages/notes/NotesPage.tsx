import { Card, Tooltip, Typography, Row, Col, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Link, Outlet, useMatch } from "react-router";

const { Title, Paragraph, Text } = Typography;

type Note = {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
};

const mockNotes: Note[] = [
  {
    id: "1",
    title: "ملاحظة حول الاجتماع",
    body: "يرجى التأكد من تجهيز العرض التقديمي قبل اجتماع يوم الاثنين القادم.",
    date: "2025-04-15",
    author: "أحمد علي",
  },
  {
    id: "2",
    title: "تنبيه للموظفين",
    body: "يرجى تعبئة استمارة الأداء السنوي قبل نهاية هذا الأسبوع.",
    date: "2025-04-14",
    author: "سارة محمود",
  },
  {
    id: "3",
    title: "فكرة تطوير",
    body: "اقتراح بإنشاء صفحة خاصة بالتقارير التفاعلية باستخدام أدوات تحليل البيانات.",
    date: "2025-04-10",
    author: "محمود حسن",
  },
  {
    id: "4",
    title: "ملاحظة حول الاجتماع",
    body: "يرجى التأكد من تجهيز العرض التقديمي قبل اجتماع يوم الاثنين القادم.",
    date: "2025-04-15",
    author: "أحمد علي",
  },
  {
    id: "5",
    title: "تنبيه للموظفين تنبيه للموظفين تنبيه للموظفين تنبيه للموظفين",
    body: "يرجى تعبئة استمارة الأداء السنوي قبل نهاية هذا الأسبوع. يرجى تعبئة استمارة الأداء السنوي قبل نهاية هذا الأسبوع. يرجى تعبئة استمارة الأداء السنوي قبل نهاية هذا الأسبوع. يرجى تعبئة استمارة الأداء السنوي قبل نهاية هذا الأسبوع.",
    date: "2025-04-14",
    author: "سارة محمود",
  },
  {
    id: "6",
    title: "فكرة تطوير",
    body: "اقتراح بإنشاء صفحة خاصة بالتقارير التفاعلية باستخدام أدوات تحليل البيانات.",
    date: "2025-04-10",
    author: "محمود حسن",
  },
];

const NotesPage: React.FC = () => {
  const isNotes = useMatch("/notes");
  const handleEdit = (note: Note) => {
    console.log("Edit note:", note);
  };

  const handleDelete = (id: string) => {
    console.log("Delete note:", id);
  };

  const handleView = (note: Note) => {
    console.log("View note:", note);
  };

  if (!isNotes) return <Outlet />;
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">المذكرات</h1>

        {/* Add Button */}
        <Link
          to={"/notes/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
         bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
        >
          <PlusOutlined />
          <span>إضافة مذكرة</span>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        {mockNotes.map((note, index) => (
          <Col xs={24} sm={12} lg={8} key={note.id}>
            <Card
              title={note.title}
              extra={
                <Text type="secondary">
                  {dayjs(note.date).format("YYYY/MM/DD")}
                </Text>
              }
              className={`shadow-md rounded-2xl border-none ${
                index % 3 === 0
                  ? "bg-blue-50"
                  : index % 3 === 1
                  ? "bg-green-50"
                  : "bg-yellow-50"
              }`}
              actions={[
                <Link to={"1"}>
                  <Tooltip title="عرض">
                    <EyeOutlined onClick={() => handleView(note)} />
                  </Tooltip>
                </Link>,
                <Tooltip title="تعديل">
                  <EditOutlined onClick={() => handleEdit(note)} />
                </Tooltip>,
                <Popconfirm
                  title="هل أنت متأكد من حذف هذه الملاحظة؟"
                  onConfirm={() => handleDelete(note.id)}
                  okText="نعم"
                  cancelText="لا"
                >
                  <Tooltip title="حذف">
                    <DeleteOutlined className="text-red-500" />
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <div className="h-16">
                <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                  {note.body}
                </Paragraph>
              </div>
              <Text className="text-sm text-gray-500">
                أضيفت بواسطة: {note.author}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default NotesPage;
