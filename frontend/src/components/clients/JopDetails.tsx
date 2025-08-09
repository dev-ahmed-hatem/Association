import { Client } from "@/types/client";
import { Descriptions } from "antd";

const JopDetails = ({ client }: { client: Client }) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="الرتبة">{client.rank}</Descriptions.Item>
      <Descriptions.Item label="رقم الأقدمية">
        {client.seniority}
      </Descriptions.Item>
      <Descriptions.Item label="جهة العمل">
        {client.work_entity}
      </Descriptions.Item>
      <Descriptions.Item label="تاريخ التعيين">
        {client.hire_date}
      </Descriptions.Item>
      <Descriptions.Item label="رقم العضوية">
        {client.membership_number}
      </Descriptions.Item>
      <Descriptions.Item label="نوع العضوية">
        {client.membership_type}
      </Descriptions.Item>
      <Descriptions.Item label="تاريخ الاشتراك">
        {client.subscription_date}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default JopDetails;
