import { Descriptions } from "antd";
import { Loan } from "@/types/loan";
import LoanStatusBadge from "./LoanStatusBadge";
import { Link } from "react-router";

const LoanDetails = ({ loan }: { loan: Loan }) => {
  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="العميل">
        <Link
          to={`/clients/client-profile/${loan.client}/`}
          className={`name text-base font-bold hover:underline hover:text-minsk`}
        >
          {loan.client_name}
        </Link>
      </Descriptions.Item>
      <Descriptions.Item label="المبلغ">
        <Link to={`/financials/incomes/${loan.financial_record}`}>
          <span className="text-xl font-bold text-red-600 hover:text-red-500 cursor-pointer hover:underline">
            {loan.amount} ج.م
          </span>
        </Link>
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
