import { Button } from "antd";

const ErrorPage = ({
  title,
  subtitle,
  notFound = false,
  reload = true,
}: {
  title?: string;
  subtitle?: string;
  notFound?: boolean;
  reload?: boolean;
}) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 min-h-96">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        {title !== undefined
          ? title
          : notFound
          ? "الصفحة غير موجودة"
          : "حدث خطأ!"}
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        {subtitle !== undefined
          ? subtitle
          : notFound
          ? "عذرًا، الصفحة التي تحاول الوصول إليها غير موجودة."
          : "حدث خطأ غير متوقع. الرجاء إعادة المحاولة لاحقًا."}
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        {reload && !notFound && (
          <Button
            type="primary"
            htmlType="button"
            size="large"
            onClick={() => window.location.reload()}
          >
            إعادة تحميل الصفحة
          </Button>
        )}

        <Button
          type="primary"
          htmlType="button"
          size="large"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
