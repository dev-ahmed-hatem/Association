import {
  Button,
  Card,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Table,
} from "antd";
import { useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { tablePaginationConfig } from "@/utils/antd";
import { ColumnsType } from "antd/es/table";
import { Dayjs } from "dayjs";

type CustomDay = {
  id: number;
  date: string;
  name: string;
};

const EmergencyDays = () => {
  const [emergencyDays, setEmergencyDays] = useState<CustomDay[]>([]);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyDate, setEmergencyDate] = useState<Dayjs | null>(null);

  const handleAddEmergencyDay = () => {
    if (!emergencyDate || !emergencyName)
      return message.warning("أدخل الاسم والتاريخ");

    setEmergencyDays((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: emergencyDate.format("YYYY-MM-DD"),
        name: emergencyName,
      },
    ]);
    setEmergencyDate(null);
    setEmergencyName("");
  };

  const handleDeleteEmergencyDay = (id: number) => {
    setEmergencyDays((prev) => prev.filter((d) => d.id !== id));
  };

  const columns: ColumnsType<CustomDay> = [
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="حذف هذا اليوم؟"
          onConfirm={() => handleDeleteEmergencyDay(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title="أيام الحضور الاضطرارية"
      className="shadow-lg rounded-xl mb-8 pb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <DatePicker
          value={emergencyDate}
          onChange={setEmergencyDate}
          placeholder="تاريخ الحضور"
          className="w-full md:w-48"
        />
        <Input
          value={emergencyName}
          onChange={(e) => setEmergencyName(e.target.value)}
          placeholder="اسم اليوم"
          className="w-full md:w-64"
        />
        <Button
          icon={<PlusOutlined />}
          onClick={handleAddEmergencyDay}
          className="w-full md:w-auto"
        >
          إضافة
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={emergencyDays}
        rowKey="id"
        pagination={tablePaginationConfig()}
        bordered
        scroll={{ x: "max-content" }}
        className="clickable-table  calypso-header"
      />
    </Card>
  );
};

export default EmergencyDays;
