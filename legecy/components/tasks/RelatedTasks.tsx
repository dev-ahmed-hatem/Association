import React from "react";
import { Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { priorityColors, statusColors, Task } from "@/types/task";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { tablePaginationConfig } from "@/utils/antd";
import { isOverdue } from "@/utils";

interface RelatedTasksProps {
  task: Task;
}

const columns: ColumnsType<Task> = [
  {
    title: "اسم المهمة",
    dataIndex: "title",
    key: "title",
    render: (value, record) => (
      <Space>
        <span className="flex flex-col">
          <div className="name text-base">{value}</div>
          <div className="id text-xs text-gray-400">#{record.id}</div>
        </span>
      </Space>
    ),
  },
  {
    title: "الحالة",
    dataIndex: "status",
    key: "status",
    filters: [
      { text: "مكتمل", value: "مكتمل" },
      { text: "غير مكتمل", value: "غير مكتمل" },
      { text: "متأخر", value: "متأخر" },
    ],
    filterOnClose: false,
    onFilter: (value, record) => {
      return value === "متأخر"
        ? isOverdue(record.due_date)
        : record.status === value;
    },
    render: (status: Task["status"], record) => (
      <div className="flex gap-2">
        <Tag color={statusColors[status]}>{status}</Tag>
        {isOverdue(record.due_date) && record.status === "غير مكتمل" && (
          <Tag color="red">متأخر</Tag>
        )}
      </div>
    ),
  },
  {
    title: "الأولوية",
    dataIndex: "priority",
    key: "priority",
    filters: [
      { text: "منخفض", value: "منخفض" },
      { text: "متوسط", value: "متوسط" },
      { text: "مرتفع", value: "مرتفع" },
    ],
    filterOnClose: false,
    onFilter: (value, record) => {
      return record.priority === value;
    },
    render: (priority: Task["priority"]) => (
      <Tag color={priorityColors[priority]}>{priority}</Tag>
    ),
  },
  {
    title: "تاريخ الاستحقاق",
    dataIndex: "due_date",
    key: "due_date",
    sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix(),
    render: (date) => dayjs(date).format("YYYY-MM-DD"),
  },
];

const RelatedTasks: React.FC<RelatedTasksProps> = ({ task }) => {
  const navigate = useNavigate();

  // Get current task
  if (!task.project) {
    return (
      <p className="text-gray-500 text-lg text-center mb-3">
        هذه المهمة غير مرتبطة بمشروع.
      </p>
    );
  }

  // display empty message if only contains this task
  if (task.project_tasks?.length < 2) {
    return (
      <p className="text-gray-500 text-lg text-center mb-3">
        لا توجد مهام مرتبطة أخرى.
      </p>
    );
  }

  return (
    <Table
      columns={columns}
      onRow={(record) => ({
        onClick: () => navigate(`/tasks/task/${record.id}`),
      })}
      dataSource={task.project_tasks.filter(
        (related_task) => related_task.id !== task.id
      )}
      rowKey="id"
      pagination={tablePaginationConfig()}
      bordered
      className="calypso-header clickable-table"
      scroll={{ x: "max-content" }}
    />
  );
};

export default RelatedTasks;
