import { useEffect, useState } from "react";
import { Modal, Checkbox, Collapse, Button } from "antd";
import { CaretLeftOutlined, SettingOutlined } from "@ant-design/icons";
import { CollapseProps } from "antd/lib";
import {
  useGetPermissionsListQuery,
  useSetPermissionsMutation,
} from "@/app/api/endpoints/users";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/Error";
import { useNotification } from "@/providers/NotificationProvider";

const modules_perms: Record<string, string[]> = {
  الأعضاء: ["عرض", "إضافة", "تعديل", "حذف"],
  المشروعات: ["عرض", "إضافة", "تعديل", "حذف"],
  الإيرادات: ["عرض", "إضافة", "تعديل", "حذف"],
  المصروفات: ["عرض", "إضافة", "تعديل", "حذف"],
  الاشتراكات: ["عرض", "إضافة", "تعديل", "حذف"],
  الأقساط: ["عرض", "إضافة", "تعديل", "حذف"],
  القروض: ["عرض", "إضافة", "حذف"],
  الإعدادات: [
    "جهات العمل",
    "الحسابات البنكية",
    "أنواع المعاملات المالية",
    "الاشتراكات حسب الرتبة",
  ],
};

type PermissionManagerProps = {
  user_id: string;
};

const PermissionManager = ({ user_id }: PermissionManagerProps) => {
  const notification = useNotification();
  const [open, setOpen] = useState(false);

  const [checked, setChecked] = useState<string[]>([]);
  const [changed, setChanged] = useState<Record<string, boolean>>({});

  const {
    data: permissions,
    isError,
    isFetching,
  } = useGetPermissionsListQuery(user_id);

  const [
    handlPermissions,
    { isError: failed, isSuccess: permissionsSet, isLoading: setting },
  ] = useSetPermissionsMutation();

  const handleCheck = (perm: string, checkedStatus: boolean) => {
    // change the checked list (for display)
    let newChecked: string[];
    if (checkedStatus) {
      newChecked = [...checked, perm];
    } else {
      newChecked = checked.filter((p) => p !== perm);
    }
    setChecked(newChecked);

    // track changed permissions
    setChanged((prev) => {
      return { ...prev, [perm]: checkedStatus };
    });
  };

  const handleSubmit = () => {
    handlPermissions({ user_id, permissions: changed });
  };

  const items: CollapseProps["items"] = Object.entries(modules_perms).map(
    ([module, perms], idx) => ({
      key: module,
      label: module,
      children: (
        <div className="grid grid-cols-2 gap-2">
          {perms.map((perm) => {
            const permName = `${module}.${perm}`;
            return (
              <Checkbox
                key={permName}
                checked={checked.includes(permName)}
                onChange={(e) => handleCheck(permName, e.target.checked)}
              >
                {perm}
              </Checkbox>
            );
          })}
        </div>
      ),
    })
  );

  useEffect(() => {
    if (permissions) setChecked(permissions);
  }, [permissions]);

  useEffect(() => {
    if (failed) {
      notification.error({ message: "خطأ في حفظ الصلاحيات!" });
    }
  }, [failed]);

  useEffect(() => {
    if (permissionsSet) {
      notification.success({
        message: "تم حفظ الصلاحيات",
      });
      setOpen(false);
    }
  }, [permissionsSet]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <>
      <Button icon={<SettingOutlined />} onClick={() => setOpen(true)}>
        الصلاحيات
      </Button>

      <Modal
        title="إدارة الصلاحيات"
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        onOk={handleSubmit}
        okButtonProps={{ loading: setting }}
        width={700}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Collapse
          accordion
          expandIcon={({ isActive }) => (
            <CaretLeftOutlined
              className={`transition-transform duration-300 ${
                isActive ? "-rotate-90" : ""
              }`}
            />
          )}
          items={items}
        />
      </Modal>
    </>
  );
};

export default PermissionManager;
