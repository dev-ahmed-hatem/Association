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

const Holidays = () => {
  const [holidays, setHolidays] = useState<CustomDay[]>([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState<Dayjs | null>(null);

  const handleAddHoliday = () => {
    if (!holidayDate || !holidayName)
      return message.warning("أدخل الاسم والتاريخ");

    setHolidays((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: holidayDate.format("YYYY-MM-DD"),
        name: holidayName,
      },
    ]);
    setHolidayDate(null);
    setHolidayName("");
  };

  const handleDeleteHoliday = (id: number) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
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
          onConfirm={() => handleDeleteHoliday(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];
  return (
    <Card title="الإجازات" className="shadow-lg rounded-xl mb-8 pb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <DatePicker
          value={holidayDate}
          onChange={setHolidayDate}
          placeholder="تاريخ الإجازة"
          className="w-full md:w-48"
        />
        <Input
          value={holidayName}
          onChange={(e) => setHolidayName(e.target.value)}
          placeholder="اسم الإجازة"
          className="w-full md:w-64"
        />
        <Button
          icon={<PlusOutlined />}
          onClick={handleAddHoliday}
          className="w-full md:w-auto"
        >
          إضافة
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={holidays}
        rowKey="id"
        pagination={tablePaginationConfig()}
        bordered
        scroll={{ x: "max-content" }}
        className="clickable-table  calypso-header"
      />
    </Card>
  );
};

export default Holidays;
