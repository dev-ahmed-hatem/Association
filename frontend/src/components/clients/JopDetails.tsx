import { Descriptions } from "antd";
import { Employee } from "../../types/employee";

const JopDetails = ({ employee }: { employee: Employee }) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="الكود">{employee.employee_id}</Descriptions.Item>
      <Descriptions.Item label="المسمى الوظيفي">
        {employee.position}
      </Descriptions.Item>
      <Descriptions.Item label="القسم">{employee.department}</Descriptions.Item>
      <Descriptions.Item label="تاريخ التوظيف">
        {employee.hire_date}
      </Descriptions.Item>
      <Descriptions.Item label="وضع العمل">{employee.mode}</Descriptions.Item>
    </Descriptions>
  );
};

export default JopDetails;
