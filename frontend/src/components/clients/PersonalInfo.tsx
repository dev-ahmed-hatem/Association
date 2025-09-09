import { Client } from "@/types/client";
import { textify } from "@/utils";
import { Descriptions } from "antd";

const PersonalInfo = ({ client }: { client: Client }) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="الاسم">{client.name}</Descriptions.Item>
      <Descriptions.Item label="الرقم القومي">
        {client.national_id}
      </Descriptions.Item>
      <Descriptions.Item label="تاريخ الميلاد">
        {client.birth_date}
      </Descriptions.Item>
      <Descriptions.Item label="العمر">{client.age} سنة</Descriptions.Item>
      <Descriptions.Item label="رقم الهاتف">
        {client.phone_number}
      </Descriptions.Item>
      <Descriptions.Item label="الحالة الاجتماعية">
        {client.marital_status}
      </Descriptions.Item>
      <Descriptions.Item label="محل الإقامة">
        {textify(client.residence) ?? "-"}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default PersonalInfo;
