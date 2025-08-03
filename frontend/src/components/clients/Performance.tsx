import { Descriptions, Badge } from "antd";
import { Employee } from "../../types/employee";

const Performance = ({
  performance,
}: {
  performance: Employee["performance"];
}) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="إجمالي المشاريع">
        <span className="text-base">{performance.totalProjects}</span>
      </Descriptions.Item>
      <Descriptions.Item label="المشاريع الحالية">
        <span
          className="bg-green-500 text-white
         rounded-full size-6 flex items-center justify-center"
        >
          {performance.activeProjects}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="إجمالي التكليفات">
        <span className="text-base">{performance.totalAssignments}</span>
      </Descriptions.Item>
      <Descriptions.Item label="التكليفات الحالية">
        <span
          className="bg-orange-500 text-white
         rounded-full size-6 flex items-center justify-center"
        >
          {performance.activeAssignments}
        </span>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default Performance;
