import { Tag } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

type LoanStatusBadgeProps = {
  is_completed: boolean;
};

const LoanStatusBadge: React.FC<LoanStatusBadgeProps> = ({ is_completed }) => {
  return is_completed ? (
    <Tag
      icon={<CheckCircleOutlined />}
      color="success"
      className="px-2 py-1 text-lg rounded-full"
    >
      مكتمل
    </Tag>
  ) : (
    <Tag
      icon={<ClockCircleOutlined />}
      color="processing"
      className="px-2 py-1 text-lg rounded-full"
    >
      جاري
    </Tag>
  );
};

export default LoanStatusBadge;
