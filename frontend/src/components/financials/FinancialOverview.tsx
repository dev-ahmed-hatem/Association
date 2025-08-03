import { Card, Col, Row, Statistic } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  BankOutlined,
  UserOutlined,
} from "@ant-design/icons";

const cardStyle = {
  borderRadius: "12px",
  height: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const FinancialOverview = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="إيرادات اليوم"
            value={1500}
            prefix={<ArrowUpOutlined />}
            suffix="ج.م"
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="إيرادات هذا الشهر"
            value={45000}
            prefix={<CalendarOutlined />}
            suffix="ج.م"
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="مصروفات اليوم"
            value={800}
            prefix={<ArrowDownOutlined />}
            suffix="ج.م"
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="مصروفات هذا الشهر"
            value={20000}
            prefix={<CalendarOutlined />}
            suffix="ج.م"
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="إجمالي المرتبات هذا الشهر"
            value={12000}
            prefix={<UserOutlined />}
            suffix="ج.م"
            valueStyle={{ color: "#722ed1" }}
          />
        </Card>
      </Col>

      <Col xs={24} md={12} lg={8}>
        <Card
          style={{ ...cardStyle, backgroundColor: "#006d75", color: "white" }}
        >
          <Statistic
            title={<span style={{ color: "white" }}>صافي الربح</span>}
            value={25000}
            prefix={<BankOutlined />}
            suffix="ج.م"
            valueStyle={{ color: "white" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default FinancialOverview;
