import { useEffect, useState } from "react";
import { Button, Table, Card } from "antd";
import { EditOutlined } from "@ant-design/icons";
import RankFeeForm from "./RankFeeForm";
import ErrorPage from "@/pages/Error";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { RankFee } from "@/types/rank_fee";
import { useGetRankFeesQuery, useRankFeeMutation } from "@/app/api/endpoints/rank_fees";

const RankFeeManager = () => {
  const notification = useNotification();
  const [editingRankFee, setEditingRankFee] =
    useState<RankFee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");

  const {
    data: rankFees,
    isFetching,
    isError,
  } = useGetRankFeesQuery({ no_pagination: true });
  const [
    handleType,
    {
      isLoading: handlingRankFee,
      isError: rankFeeIsError,
      isSuccess: rankFeeIsSuccess,
      error: rankFeeError,
    },
  ] = useRankFeeMutation();

  const handleEdit = (updated: RankFee) => {
    setMessage("تم تعديل قيمة الاشتراك");
    handleType({
      data: updated,
      method: "PATCH",
      url: `/financials/rank-fees/${updated.id}/`,
    });
  };

  const columns = [
    {
      title: "",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "الرتبة",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "الاشتراك الشهري",
      dataIndex: "fee",
      key: "fee",
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: RankFee) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRankFee(record);
              setIsModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (rankFeeIsError) {
      const error = rankFeeError as axiosBaseQueryError;
      let message = error.data.detail ?? null;
      notification.error({ message: message ?? "خطأ في تنفيذ الإجراء!" });
    }
  }, [rankFeeIsError]);

  useEffect(() => {
    if (rankFeeIsSuccess) {
      notification.success({
        message: message,
      });
    }
  }, [rankFeeIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <Card title="الاشتراكات حسب الرتبة" className="shadow-md">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rankFees}
        pagination={false}
      />

      <RankFeeForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEdit}
        initialValues={editingRankFee!}
        loading={handlingRankFee}
      />
    </Card>
  );
};

export default RankFeeManager;
