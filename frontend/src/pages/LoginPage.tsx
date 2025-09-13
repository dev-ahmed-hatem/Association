import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginMutation, useVerifyMutation } from "@/app/api/endpoints/auth";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { storeTokens } from "@/utils/storage";

const LoginPage = () => {
  const [params] = useSearchParams();

  // login flags
  const [
    login,
    {
      data: tokens,
      isLoading: logging,
      isSuccess: logged,
      isError: wrongCredentials,
    },
  ] = useLoginMutation();

  // verify flags
  const [verify, { isLoading: verifying, isSuccess: verified }] =
    useVerifyMutation();

  const [message, setMessage] = useState<string | null>(null);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setMessage(null);
    login({ username: values.username, password: values.password });
  };

  useEffect(() => {
    // initial verify
    const access = localStorage.getItem("access");
    if (access) verify({ access });
  }, []);

  useEffect(() => {
    if (wrongCredentials) {
      setMessage("بيانات تسجيل خاطئة");
      form.resetFields();
    }
  }, [wrongCredentials]);

  useEffect(() => {
    const next = params.get("next");
    const path = next && next !== "/login" ? next : "/";

    // store tokens
    if (logged) storeTokens(tokens);
    if (logged || verified) window.location.href = path;
  }, [logged, verified]);

  if (verifying || logged || verified) return <Loading />;
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-minsk-950 text-white relative">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/background.avif"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-minsk via-minsk-950 to-minsk-950 opacity-70"></div>
      </div>

      {/* Right side: Login form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-minsk-900/30 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center rounded-full border-2 border-minsk-500 bg-white">
              <img
                src="./logo.jpeg"
                alt="Logo"
                className="size-36 object-contain rounded-full border border-gray-200"
              />
            </div>
          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            form={form}
            className="w-full"
          >
            <Form.Item
              label={<span className="text-white">اسم المستخدم</span>}
              name="username"
              rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
            >
              <Input
                size="large"
                placeholder="اسم المستخدم"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-white">كلمة المرور</span>}
              name="password"
              rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
            >
              <Input.Password
                size="large"
                placeholder="كلمة المرور"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            {message && (
              <div className="text-center text-lg text-red-500 font-bold">
                {message}
              </div>
            )}

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-minsk-600 hover:bg-minsk-800 border-none"
                loading={logging}
              >
                تسجيل دخول
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Left side: Welcome section */}
      <div className="relative z-10 flex-1 hidden md:flex flex-col justify-center items-start p-6 lg:p-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-snug text-orange-400">
          جمعية التكافل الاجتماعي لضباط الشرطة بالمنوفية
        </h1>
        <p className="text-base sm:text-lg opacity-90 mb-2 text-green-500">
          المشهرة برقم ٧٥٩ لسنة ١٩٩١
        </p>
        <p className="text-sm sm:text-base opacity-70 max-w-md mt-4">
          مرحباً بكم في نظام تسجيل الدخول. يرجى إدخال بياناتكم للوصول إلى لوحة
          التحكم الخاصة بكم.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
