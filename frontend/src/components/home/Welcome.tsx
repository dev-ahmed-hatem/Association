import React from "react";
import { SmileOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/app/redux/hooks";

const Welcome: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center px-6 py-6 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 rounded-lg shadow-2xl gap-4 text-white">
      {/* Logo */}
      <img
        src="./logo.jpeg"
        alt="Logo"
        className="size-28 object-contain rounded-full border-4 border-white shadow-lg bg-white"
      />

      {/* Text */}
      <div className="flex flex-col text-center sm:text-right flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
          مرحبًا بك،
          <span className="text-yellow-400">{user?.name}</span>
          <SmileOutlined className="text-yellow-400" />
        </h1>
      </div>
    </div>
  );
};

export default Welcome;
