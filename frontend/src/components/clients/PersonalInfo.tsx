import { Employee } from "../../types/employee";
import { Descriptions } from "antd";

const PersonalInfo = ({ employee }: { employee: Employee }) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="الاسم">{employee.name}</Descriptions.Item>
      <Descriptions.Item label="الجنس">{employee.gender}</Descriptions.Item>
      <Descriptions.Item label="البريد الإلكتروني">
        {employee.email}
      </Descriptions.Item>
      <Descriptions.Item label="رقم الهاتف">{employee.phone}</Descriptions.Item>
      <Descriptions.Item label="العنوان">{employee.address}</Descriptions.Item>
      <Descriptions.Item label="العمر">{employee.age} سنة</Descriptions.Item>
      <Descriptions.Item label="تاريخ الميلاد">
        {employee.birth_date}
      </Descriptions.Item>
      <Descriptions.Item label="الرقم القومي">
        {employee.national_id}
      </Descriptions.Item>
      <Descriptions.Item label="الحالة الاجتماعية">
        {employee.marital_status}
      </Descriptions.Item>
      <Descriptions.Item label="السيرة الذاتية">
        {employee.cv ? (
          <a
            className="underline text-blue-500"
            href={employee.cv}
            target="_blank"
            rel="noopener noreferrer"
          >
            {decodeURIComponent(employee.cv.split("/").slice(-1)[0])}
          </a>
        ) : (
          <span className="text-red-600">لا يوجد</span>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default PersonalInfo;
