import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginMutation, useVerifyMutation } from "@/app/api/endpoints/auth";
import { useNavigate, useSearchParams } from "react-router";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-md max-md max-md:border-x-4 border-black overflow-hidden flex flex-col md:flex-row w-full max-w-md md:max-w-4xl">
        {/* Left: Logo */}
        <div className="md:w-1/2 max-md:h-52 bg-white flex items-center justify-center p-2">
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="max-lg:h-full md:w-full object-cover"
          />
        </div>

        {/* Right: Form */}
        <div className="md:w-1/2 w-full p-6 sm:p-10 flex flex-col justify-center text-right md:border-e-4 border-black">
          <h2 className="text-2xl font-bold mb-8 max-md:text-center">
            تسجيل دخول
          </h2>

          <Form
            layout="vertical"
            onFinish={onFinish}
            form={form}
            className="rtl text-right"
          >
            <Form.Item
              label="اسم المستخدم:"
              name="username"
              rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
            >
              <Input
                size="large"
                placeholder="اسم المستخدم"
                prefix={<UserOutlined />}
                autoFocus
              />
            </Form.Item>

            <Form.Item
              label="كلمة المرور:"
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
              <div className="text-center text-base text-red-600 font-bold">
                بيانات تسجيل خاطئة
              </div>
            )}

            <Form.Item className="text-center mt-5">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="text-white w-full"
                loading={logging}
              >
                تسجيل دخول
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
