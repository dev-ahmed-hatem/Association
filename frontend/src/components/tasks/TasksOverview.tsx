import { Card, Progress, Statistic, Row, Col } from "antd";
import { TasksStats } from "../../types/task";

const TasksOverview = ({ stats }: { stats: TasksStats }) => {
  return (
    <Card title="نظرة عامة على المهام" className="shadow-lg rounded-xl">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Statistic title="إجمالي المهام" value={stats.total} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="المهام المكتملة" value={stats.completed} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic
            title="المهام المتأخرة"
            value={stats.overdue}
            valueStyle={{ color: "#cf1322" }}
          />
        </Col>
      </Row>
      <Progress
        percent={stats.rate}
        status={stats.rate === 100 ? "success" : "active"}
        className="mt-4"
      />
    </Card>
  );
};

export default TasksOverview;
