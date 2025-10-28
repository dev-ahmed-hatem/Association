import React, { useState } from "react";
import { Card, Typography } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { BankAccount } from "@/types/bank_account";
import { useGetBankAccountsQuery } from "@/app/api/endpoints/bank_accounts";
import ErrorPage from "@/pages/Error";
import Loading from "../Loading";

const { Title } = Typography;

const gradients = [
  "from-indigo-600 via-purple-600 to-pink-600",
  "from-blue-600 via-teal-500 to-green-500",
  "from-orange-600 via-red-600 to-pink-600",
  "from-cyan-600 via-sky-600 to-indigo-600",
  "from-emerald-600 via-lime-500 to-green-500",
];


const BankBalances: React.FC = () => {
  const {
    data: accounts,
    isFetching,
    isError,
  } = useGetBankAccountsQuery({ no_pagination: true });

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <div className="mb-10">
      <Title
        level={3}
        className="!text-2xl !font-bold text-center !mb-8 text-gray-800"
      >
        أرصدة حسابات البنوك
      </Title>

      <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
        {accounts?.map((bank, idx) => {
          const gradient = gradients[idx % gradients.length];
          return (
            <div
              key={bank.id}
              className={`rounded-2xl shadow-lg bg-gradient-to-br ${gradient} text-white overflow-hidden 
              transform transition-all duration-300 hover:scale-[101%] hover:shadow-2xl`}
            >
              <Card
                variant="borderless"
                className="bg-transparent !p-5 !text-white h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BankOutlined className="text-lg opacity-90" />
                    <h3 className="text-xl font-semibold">{bank.name}</h3>
                  </div>
                </div>

                <div className="mt-2 transition-all duration-700 ease-out hover:translate-y-[-2px]">
                  <p className="text-sm opacity-90 mb-1">الرصيد الحالي</p>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {Number(bank.balance).toLocaleString("en-EG")}{" "}
                    <span className="text-lg font-medium">ج.م</span>
                  </h2>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BankBalances;
