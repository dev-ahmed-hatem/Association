import { Card, Row, Col, Statistic } from "antd";
import {
  ProjectOutlined,
  CheckCircleOutlined,
  HourglassOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { ProjectsStats } from "@/types/project";

const ProjectsOverview = ({
  total,
  ongoing,
  completed,
  pending_approval,
  paused,
  overdue,
}: ProjectsStats) => {
  return (
    <Card className="shadow-lg rounded-lg">
      <Row gutter={[8, 8]}>
        {/* Total Projects Section */}
        <Col xs={24} sm={12} md={8}>
          <Card className="bg-calypso-800 text-white">
            <Statistic
              title={
                <span className="text-white text-base">إجمالي المشاريع</span>
              }
              value={total}
              valueStyle={{ color: "#fff" }}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>

        {/* Ongoing Projects */}
        <Col xs={24} sm={12} md={8}>
          <Card className="border border-gray-200">
            <Statistic
              title="المشاريع الجارية"
              value={ongoing}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>

        {/* Completed Projects */}
        <Col xs={24} sm={12} md={8}>
          <Card className="border border-gray-200">
            <Statistic
              title="المشاريع المكتملة"
              value={completed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        {/* Pending Approval */}
        <Col xs={24} sm={12} md={8}>
          <Card className="border border-gray-200">
            <Statistic
              title="قيد الموافقة"
              value={pending_approval}
              valueStyle={{ color: "#faad14" }}
              prefix={<HourglassOutlined />}
            />
          </Card>
        </Col>

        {/* Paused Projects */}
        <Col xs={24} sm={12} md={8}>
          <Card className="border border-gray-200">
            <Statistic
              title="المشاريع الموقوفة"
              value={paused}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>

        {/* Overdue Projects */}
        <Col xs={24} sm={12} md={8}>
          <Card
            className={`border border-gray-200 ${overdue > 0 && "bg-red-600"}`}
          >
            <Statistic
              title={
                <span className={`${overdue > 0 && "text-white"}`}>
                  المشاريع المتأخرة
                </span>
              }
              value={overdue}
              valueStyle={{ color: overdue > 0 ? "#fff" : "#f5222d" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default ProjectsOverview;
