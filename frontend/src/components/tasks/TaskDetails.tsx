import React, { Fragment } from "react";
import { Card, Descriptions, Tag } from "antd";
import { priorityColors, statusColors, Task } from "@/types/task";
import { Link } from "react-router";

interface TaskDetailsProps {
  task: Task;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
  return (
    <Card className="shadow-md rounded-xl">
      <Descriptions title="تفاصيل المهمة" bordered column={1}>
        <Descriptions.Item label="الكود">{task.id}</Descriptions.Item>
        <Descriptions.Item label="الاسم">{task.title}</Descriptions.Item>
        <Descriptions.Item label="الوصف">
          {task.description || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="الأقسام">
          {task!.departments.map((dep) => dep.name).join("، ")}
        </Descriptions.Item>
        <Descriptions.Item label="الموعد النهائي">
          {task.due_date}
        </Descriptions.Item>
        <Descriptions.Item label="فريق العمل">
          {task.assigned_to.map((emp, index, array) => (
            <Fragment key={emp.id}>
              <Link
                to={`/employees/employee-profile/${emp.id}`}
                className={`${
                  emp.is_active
                    ? "text-blue-700 hover:text-blue-500"
                    : "text-red-700 hover:text-red-500"
                } hover:underline`}
              >
                {emp.name}
              </Link>
              {index + 1 !== array.length && "، "}
            </Fragment>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="الحالة">
          <Tag color={statusColors[task.status]}>{task.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="الأولوية">
          <Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="المشروع المرتبط">
          {task!.project ? (
            <Link
              to={`/projects/project/${task!.project.id}`}
              className="text-blue-700 hover:underline hover:text-blue-500"
            >
              {task!.project.name}
            </Link>
          ) : (
            <Tag color="gray">غير مرتبط بمشروع</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default TaskDetails;
