import { useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Table,
  Button,
  Select,
  Popconfirm,
  TimePicker,
  Space,
  Form,
  Spin,
} from "antd";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  useDeleteAttendanceRecordMutation,
  useGetDayAttendanceQuery,
  useUpdateDayAttendanceMutation,
} from "@/app/api/endpoints/attendance";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/Error";
import { useGetAllEmployeesQuery } from "@/app/api/endpoints/employees";
import { AssignedEmployee } from "@/types/employee";
import { useNotification } from "@/providers/NotificationProvider";

type AttendanceRecord = {
  key: string | number;
  employee: AssignedEmployee | null;
  check_in: string | null;
  check_out?: string;
  editing?: boolean;
  saved: boolean;
};

const AttendanceRecords = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const notification = useNotification();
  const [form] = Form.useForm();

  const [date, setDate] = useState(dayjs()); // Default to today's date

  const [currentDeletedRecord, setcurrentDeletedRecord] = useState<
    number | null
  >(null);

  // queries

  // fetch attendance data
  const {
    data: savedAttendanceRecords,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDayAttendanceQuery({
    date: date.format("YYYY-MM-DD"),
  });

  // update attendnace data
  const [
    updateAttendnace,
    { isLoading: updating, isError: updateError, isSuccess: updateSuccess },
  ] = useUpdateDayAttendanceMutation();

  // delete attendance record
  const [
    deleteSavedRecord,
    {
      isLoading: deletingRecord,
      isSuccess: recordDeleted,
      isError: recordDeletingError,
    },
  ] = useDeleteAttendanceRecordMutation();

  // fetch employees
  const {
    data: employees,
    isError: employeesError,
    isFetching: employeesFetching,
  } = useGetAllEmployeesQuery();

  // Add New Attendance Row
  const addAttendanceRow = () => {
    setAttendanceRecords([
      ...attendanceRecords,
      {
        key: Date.now(),
        employee: null,
        check_in: null,
        editing: true,
        saved: false,
      },
    ]);
  };

  // Handle Cell Editing
  const handleEdit = (key: string, field: string, value: any) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.key === key ? { ...record, [field]: value } : record
      )
    );
    form.setFields([{ name: `${field}-${key}`, errors: undefined }]);
  };

  // Make a record editable
  const editRecord = (key: string) => {
    const record = attendanceRecords.find((record) => record.key === key);
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.key === key ? { ...record, editing: true } : record
      )
    );

    // set initial values
    form.setFields([
      {
        name: `employee-${key}`,
        value: { label: record?.employee?.name, value: record?.employee?.id },
      },
      {
        name: `check-in-${key}`,
        value: record?.check_in ? dayjs(record.check_in, "HH:mm") : null,
      },
      {
        name: `check-out-${key}`,
        value: record?.check_out ? dayjs(record.check_out, "HH:mm") : null,
      },
    ]);
  };

  // save record changes
  const handleSave = () => {
    form
      .validateFields({ recursive: false, validateOnly: false })
      .then((values) => {
        // normalizing attendance records for database
        const records = attendanceRecords
          .filter((record) => record.editing === true)
          .map((record) => ({
            id: record.key,
            employee: record.employee?.id,
            check_in: record.check_in,
            check_out: record.check_out,
            saved: record.saved,
          }));

        // perform update
        updateAttendnace({ date: date.format("YYYY-MM-DD"), records });
      });
  };

  // Delete a Row
  const handleDelete = (key: number) => {
    const record = attendanceRecords.find((record) => record.key === key);
    if (record?.saved) {
      setcurrentDeletedRecord(key);
      deleteSavedRecord(key.toString());
    } else {
      setAttendanceRecords((prev) =>
        prev.filter((record) => record.key !== key)
      );
    }
  };

  // Table Columns
  const columns = [
    {
      title: "الموظف",
      dataIndex: "employee",
      render: (employee: AssignedEmployee, record: any) =>
        record.editing && !record.saved ? (
          <Form.Item
            name={`employee-${record.key}`}
            rules={[
              { required: true, message: "اختر الموظف" },
              {
                validator: (rule, value) => {
                  if (
                    value &&
                    attendanceRecords.find(
                      (current) =>
                        current.employee?.id === value &&
                        current.key !== record.key
                    )
                  ) {
                    return Promise.reject(new Error("يوجد تسجيل لهذا الموظف"));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              placeholder="اختر الموظف"
              onChange={(value, option) =>
                handleEdit(record.key, "employee", {
                  id: value,
                  name: (
                    option as {
                      value: number;
                      label: string;
                    }
                  ).label,
                })
              }
              allowClear={false}
              showSearch={true}
              options={employees?.map((emp) => ({
                value: emp.id,
                label: emp.name,
              }))}
              optionFilterProp="label"
            />
          </Form.Item>
        ) : (
          employee.name
        ),
    },
    {
      title: "وقت الحضور",
      dataIndex: "check_in",
      render: (text: string, record: any) =>
        record.editing ? (
          <Form.Item
            name={`check-in-${record.key}`}
            rules={[{ required: true, message: "حدد وقت الحضور" }]}
          >
            <TimePicker
              placeholder="حدد وقت الحضور"
              className="w-40"
              format={"HH:mm"}
              onChange={(value) =>
                handleEdit(record.key, "check_in", value?.format("HH:mm"))
              }
              allowClear={false}
            />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: "وقت الانصراف",
      dataIndex: "check_out",
      render: (text: string, record: any) =>
        record.editing ? (
          <Form.Item
            name={`check-out-${record.key}`}
            rules={[
              {
                validator: (_, value) => {
                  const checkIn = form.getFieldValue(`check-in-${record.key}`);
                  if (!value || !checkIn || value.isAfter(checkIn)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("وقت الانصراف يجب أن يكون بعد وقت الحضور")
                  );
                },
              },
            ]}
          >
            <TimePicker
              placeholder="حدد وقت الانصراف"
              className="w-40"
              format={"HH:mm"}
              onChange={(value) =>
                handleEdit(record.key, "check_out", value?.format("HH:mm"))
              }
            />
          </Form.Item>
        ) : text ? (
          text
        ) : (
          "-"
        ),
    },
    {
      title: "إجراءات",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <div className="flex gap-4 justify-between">
          <Space>
            {!record.editing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => editRecord(record.key)}
                disabled={record.key === currentDeletedRecord}
              />
            )}

            <Popconfirm
              title="هل أنت متأكد من حذف هذا السجل؟"
              onConfirm={() => handleDelete(record.key)}
              okText="نعم"
              cancelText="لا"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={record.key === currentDeletedRecord}
              />
            </Popconfirm>
            {record.key === currentDeletedRecord && (
              <Spin indicator={<LoadingOutlined spin />} />
            )}
          </Space>
        </div>
      ),
    },
  ];

  useEffect(() => {
    refetch();
  }, [date]);

  useEffect(() => {
    if (savedAttendanceRecords) {
      setAttendanceRecords(
        savedAttendanceRecords.map((attendance) => ({
          key: attendance.id,
          employee: attendance.employee,
          check_in: attendance.check_in,
          check_out: attendance.check_out,
          editing: false,
          saved: true,
        }))
      );
    }
  }, [savedAttendanceRecords]);

  // notification listeners

  // update records
  useEffect(() => {
    if (updateSuccess) {
      notification.success({
        message: "تم حفظ تسجيلات الحضور",
      });
      setAttendanceRecords((prev) =>
        prev.map((record) => ({ ...record, editing: false }))
      );
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      notification.error({
        message: "حدث خطأ أثناء حفظ تسجيلات الحضور ! برجاء إعادة المحاولة",
      });
    }
  }, [updateError]);

  // deleting record
  useEffect(() => {
    if (recordDeleted) {
      notification.success({
        message: "تم حذف تسجيل الحضور",
      });
    }
    setAttendanceRecords((prev) =>
      prev.filter((record) => record.key !== currentDeletedRecord)
    );
  }, [recordDeleted]);

  useEffect(() => {
    if (recordDeletingError) {
      notification.error({
        message: "حدث خطأ أثناء حذف تسجيل الحضور ! برجاء إعادة المحاولة",
      });
      setcurrentDeletedRecord(null);
    }
  }, [recordDeletingError]);

  if (isLoading || employeesFetching) return <Loading />;
  if (isError || employeesError) {
    return (
      <ErrorPage subtitle={"حدث خطأ أثناء تحميل بيانات الحضور"} reload={true} />
    );
  }

  return (
    <Card>
      {/* Date Picker for Attendance Records */}
      <div className="mb-4 flex gap-5 items-center flex-wrap">
        <h2 className="text-lg font-bold">تاريخ اليوم:</h2>
        <DatePicker
          value={date}
          onChange={(value) => setDate(value)}
          format="YYYY-MM-DD"
          allowClear={false}
        />
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Form form={form}>
            {/* Attendance Table */}
            <Table
              columns={columns}
              dataSource={attendanceRecords}
              pagination={false}
              className="calypso-header"
              scroll={{ x: "max-content" }}
            />
          </Form>

          {/* Add Row Button */}

          <div className="flex md:justify-between items-center mt-4 flex-wrap gap-4">
            <Button
              type="dashed"
              onClick={addAttendanceRow}
              icon={<PlusOutlined />}
            >
              إضافة صف
            </Button>

            {attendanceRecords.some((record) => record.editing) && (
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isFetching || updating}
                >
                  حفظ
                </Button>
              </Space>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default AttendanceRecords;
