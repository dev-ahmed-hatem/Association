import { removeTokens } from "@/utils/storage";
import { Button } from "antd";

const UserMenu = ({ role }: { role: string }) => {
  const logout = () => {
    removeTokens();
    location.href = "/login";
  };

  return (
    <div>
      <span>{role}</span>
      <div className="w-[80%] mx-auto my-2 h-[1px] bg-gray-300"></div>
      <Button
        className="flex my-3 w-full bg-red-500 font-bold !outline-none border-red-500
       hover:!bg-red-400 hover:border-red-400 hover:!text-black"
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
