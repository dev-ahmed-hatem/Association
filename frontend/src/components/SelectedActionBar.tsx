import React from "react";
import { Button, Popconfirm, Space, Typography } from "antd";
import { DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface SelectedActionsBarProps {
  selectedCount: number;
  onConfirmDelete: () => void;
  onClearSelection: () => void;
  deleting?: boolean;
}

const SelectedActionsBar: React.FC<SelectedActionsBarProps> = ({
  selectedCount,
  onConfirmDelete,
  onClearSelection,
  deleting,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 shadow-sm flex flex-wrap items-center justify-between">
      <Space direction="horizontal" size="middle" className="flex flex-wrap">
        <Typography.Text strong>{selectedCount} عنصر محدد</Typography.Text>

        <Popconfirm
          title="هل أنت متأكد من حذف العناصر المحددة؟"
          okText="نعم"
          cancelText="إلغاء"
          onConfirm={onConfirmDelete}
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            loading={deleting}
          >
            حذف المحدد
          </Button>
        </Popconfirm>

        <Button
          type="default"
          icon={<CloseCircleOutlined />}
          onClick={onClearSelection}
        >
          إلغاء التحديد
        </Button>
      </Space>
    </div>
  );
};

export default SelectedActionsBar;
