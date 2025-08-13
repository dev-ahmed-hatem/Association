import { removeTokens } from "@/utils/storage";
import { Button } from "antd";
import { ReactNode } from "react";

const UserMenu = ({ role }: { role: ReactNode }) => {
  const logout = () => {
    removeTokens();
    location.href = "/login";
  };

  return (
    <div>
      <span>{role}</span>
      <div className="w-[80%] mx-auto my-2 h-[1px] bg-gray-300"></div>
      <Button
        type="primary"
        className="flex my-3 w-full font-bold !outline-none"
        onClick={() => {
          logout();
        }}
      >
        تسجيل خروج
      </Button>
    </div>
  );
};

export default UserMenu;
