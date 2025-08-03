import { Spin, SpinProps } from "antd";

const Loading = ({
  size = "large",
  className = "",
}: {
  size?: SpinProps["size"];
  className?: string;
}) => {
  return (
    <div className={`h-lvh flex justify-center ${className}`}>
      <Spin className="flex items-center" size={size} />
    </div>
  );
};

export default Loading;
