export type User = {
  id: string;
  name: string;
  username: string;
  role: "مدير" | "مشرف";
  is_active: boolean;
  is_superuser: boolean;
};
