import { Client } from "@/types/client";
import { textify } from "@/utils";
import { Card } from "antd";

const ClientNotes = ({ client }: { client: Client }) => {
  return (
    <Card title="الملاحظات" className="mb-6">
      {textify(client?.notes) ? (
        <p className="text-gray-700 whitespace-pre-line">{client.notes}</p>
      ) : (
        <p className="text-gray-400 italic">لا توجد ملاحظات</p>
      )}
    </Card>
  );
};

export default ClientNotes;
