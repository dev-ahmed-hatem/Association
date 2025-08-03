import { Button, Upload, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const UploadFile = ({ setFile }: { setFile: Function }) => {
  const onChange: UploadProps["onChange"] = ({ fileList }) => {
    if (setFile) setFile(fileList[0]?.originFileObj);
  };
  return (
    <Upload
      accept=".doc,.docx,.pdf"
      beforeUpload={(file) => {
        if (file && setFile) setFile(file);
        return false;
      }}
      onChange={onChange}
      maxCount={1}
    >
      <Button icon={<UploadOutlined />}>اختر ملف</Button>
    </Upload>
  );
};

export default UploadFile;
