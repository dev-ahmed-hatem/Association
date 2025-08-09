import React from "react";
import { SmileOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/app/redux/hooks";
import { Divider } from "antd";

const Welcome: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col items-center text-center px-4">
      <img src="./logo.jpeg" alt="Logo" className="h-40 mb-6 object-contain" />

      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
        مرحبًا بك، <span className="text-blue-800">{user?.name}</span>
        <SmileOutlined />
      </h1>

      <Divider />
    </div>
  );
};

export default Welcome;
