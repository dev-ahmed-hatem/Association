import { FormInstance } from "antd";

export const handleServerErrors = ({
  errorData,
  form,
}: {
  errorData: Record<string, string[]>;
  form: FormInstance;
}) => {
  const errorFields = Object.entries(errorData).map(([field, messages]) => ({
    name: field,
    errors: messages,
  }));

  form.setFields(errorFields);
};
