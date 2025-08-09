import { Button, Card, Select } from "antd";
import { useState } from "react";
import { SaveOutlined } from "@ant-design/icons";

const arabicDays = [
  { label: "السبت", value: "Saturday" },
  { label: "الأحد", value: "Sunday" },
  { label: "الاثنين", value: "Monday" },
  { label: "الثلاثاء", value: "Tuesday" },
  { label: "الأربعاء", value: "Wednesday" },
  { label: "الخميس", value: "Thursday" },
  { label: "الجمعة", value: "Friday" },
];

const WorkSchedules = () => {
  const [workingDays, setWorkingDays] = useState<string[]>([]);

  return (
    <Card title="أيام العمل" className="shadow-lg rounded-xl mb-8 pb-6">
      <div className="flex flex-wrap gap-6 md:gap-12 justify-between">
        <div className="flex flex-wrap gap-6 md:gap-12">
          <div className="flex gap-x-4 items-center">
            <Select
              mode="multiple"
              style={{ minWidth: "220px" }}
              placeholder="اختر أيام العمل"
              value={workingDays}
              onChange={setWorkingDays}
              options={arabicDays}
            />
          </div>
        </div>
        <Button type="primary" icon={<SaveOutlined />}>
          حفظ
        </Button>
      </div>
    </Card>
  );
};

export default WorkSchedules;
