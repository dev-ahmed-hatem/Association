import { Descriptions, Tag } from "antd";
import { Loan } from "@/types/loan";
import LoanStatusBadge from "./LoanStatusBadge";
import { Link } from "react-router";
import { rankColors } from "@/types/client";

const LoanDetails = ({ loan }: { loan: Loan }) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="العميل">
        <Link
          to={`/clients/client-profile/${loan.client_data.id}/`}
          className={`name text-base font-bold hover:underline hover:text-minsk`}
        >
          {loan.client_data.name}
        </Link>
      </Descriptions.Item>
      <Descriptions.Item label="رقم العضوية">
        {loan.client_data.membership_number}
      </Descriptions.Item>
      <Descriptions.Item label="الرتبة">
        <Tag className="text-lg" color={rankColors[loan.client_data.rank]}>
          {loan.client_data.rank}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="المبلغ">
        <span className="text-xl font-bold text-red-600 hover:text-red-500 cursor-pointer hover:underline">
          {loan.amount} ج.م
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="تاريخ الإصدار">
        {loan.issued_date}
      </Descriptions.Item>
      <Descriptions.Item label="الأقساط">
        {loan.repayments.paid} / {loan.repayments.total} (غير مسدد:{" "}
        {loan.repayments.unpaid})
      </Descriptions.Item>
      <Descriptions.Item label="الحالة">
        <LoanStatusBadge is_completed={loan.is_completed} />
      </Descriptions.Item>
      {loan.notes && (
        <Descriptions.Item label="ملاحظات">{loan.notes}</Descriptions.Item>
      )}
    </Descriptions>
  );
};

export default LoanDetails;
