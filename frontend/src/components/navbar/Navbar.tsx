import { Popover, Tag } from "antd";
import { useState } from "react";
import UserMenu from "./UserMenu";
import { useAppSelector } from "@/app/redux/hooks";
import { LuPanelRight } from "react-icons/lu";
import { CgLogIn } from "react-icons/cg";
import { CodeOutlined, CrownOutlined, TeamOutlined } from "@ant-design/icons";
import { User } from "@/types/user";

// Role Tag Renderer
const renderRoleTag = (user?: User) => {
  if (user?.is_superuser) {
    return (
      <Tag
        icon={<CodeOutlined />}
        color="purple"
        className="px-3 py-1 text-sm font-medium"
      >
        مطور
      </Tag>
    );
  }

  if (user?.role === "مدير") {
    return (
      <Tag
        icon={<CrownOutlined />}
        color="gold"
        className="px-3 py-1 text-sm font-medium"
      >
        مدير
      </Tag>
    );
  }

  return (
    <Tag
      icon={<TeamOutlined />}
      color="blue"
      className="px-3 py-1 text-sm font-medium"
    >
      مشرف
    </Tag>
  );
};

const Navbar = ({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: Function;
}) => {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <div
      className="padding-container flex justify-between items-center
      bg-gradient-to-r from-minsk to-minsk-950
      py-2 h-20"
    >
      <div className="p-1 rounded-lg hover:bg-minsk-900 bg-opacity-75">
        <LuPanelRight
          className="text-white text-3xl cursor-pointer"
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        />
      </div>
      <div className="user">
        <Popover
          content={<UserMenu role={renderRoleTag(user!)} />}
          title={user?.name || <span className="text-red-500">بلا اسم</span>}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
        >
          <div className="p-1 rounded-lg hover:bg-minsk-800 bg-opacity-50">
            <CgLogIn className="text-3xl text-white cursor-pointer" />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;
