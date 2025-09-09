import React from "react";
import { SmileOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/app/redux/hooks";

const Welcome: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center px-4 py-4 bg-white rounded-lg shadow-sm gap-3">
      {/* Logo */}
      <img
        src="./logo.jpeg"
        alt="Logo"
        className="size-28 object-contain rounded-full border border-gray-200"
      />

      {/* Text */}
      <div className="flex flex-col text-center sm:text-right flex-wrap">
        <h1 className="text-lg sm:text-xl font-bold text-black flex items-center justify-center sm:justify-start gap-2">
          مرحبًا بك،
          <span className="text-blue-800">{user?.name}</span>
          <SmileOutlined className="text-yellow-500" />
        </h1>
      </div>
    </div>
  );
};

export default Welcome;
