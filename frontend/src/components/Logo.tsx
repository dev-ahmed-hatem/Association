import { Link } from "react-router";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      to={"/"}
      className="flex flex-col sm:flex-row items-center justify-center px-4 py-4 bg-white rounded-lg shadow-sm gap-3"
    >
      {/* Logo */}
      <img
        src="./logo.jpeg"
        alt="Logo"
        className="h-20 w-20 object-contain rounded-full border border-gray-200"
      />
    </Link>
  );
};

export default Logo;
