import { useEffect, useState } from "react";
import { Table, Input, Avatar, Space, Badge } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { getInitials } from "../../utils";
import { tablePaginationConfig } from "../../utils/antd";
import {
  useDeleteEmployeesMutation,
  useGetEmployeesQuery,
} from "@/app/api/endpoints/employees";
import Loading from "@/components/Loading";
import Error from "../Error";
import { ColumnsType } from "antd/es/table";
import { TableProps } from "antd/lib";
import SelectedActionsBar from "@/components/SelectedActionBar";
import { useNotification } from "@/providers/NotificationProvider";

const columns: ColumnsType = [
  {
    title: "اسم الموظف",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: any) => (
      <Space>
        <span
          className={`mx-2 rounded-full ${
            record.is_active ? "bg-green-400" : "bg-yellow-400"
          } size-2 inline-block`}
        ></span>
        {record.image ? (
          <Avatar src={record.image} />
        ) : (
          <Avatar className="bg-orange-700 text-white font-semibold">
            {getInitials(record.name)}
          </Avatar>
        )}
        <span className="flex flex-col">
          <div className="name text-base">{text}</div>
          <div className="id text-xs text-gray-400">#{record.id}</div>
        </span>
      </Space>
    ),
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "الرقم الوظيفي",
    dataIndex: "employee_id",
    key: "employee_id",
  },
  {
    title: "الوظيفة",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "القسم",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "التكليفات الجارية",
    dataIndex: "assignments",
    key: "assignments",
    render: (assignments: number) => {
      return assignments ? <Badge color="#f3760d" count={assignments} /> : null;
    },
    sorter: (a, b) => a.assignments - b.assignments,
  },
];

const ClientsList = () => {
  const [selectedList, setSelectedList] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const notification = useNotification();
  const navigate = useNavigate();

  // Search Function
  const onSearch = (value: string) => {
    setSearch(value);
  };

  const [
    deleteEmployees,
    { isError: deleteError, isLoading: deleting, isSuccess: deleted },
  ] = useDeleteEmployeesMutation();

  // handling employees
  const { data, isFetching, isError, refetch } = useGetEmployeesQuery({
    page,
    search,
  });

  const rowSelection: TableProps["rowSelection"] = {
    selectedRowKeys: selectedList,
    onChange(selectedRowKeys, selectedRows) {
      setSelectedList(selectedRows.map((row) => row.id));
    },
  };

  useEffect(() => {
    refetch();
  }, [search, page]);

  useEffect(() => {
    if (deleted) {
      notification.success({
        message: "تم حذف الموظفين",
      });
    }
    setSelectedList([]);
  }, [deleted]);

  useEffect(() => {
    if (deleteError) {
      notification.error({
        message: "حدث خطأ أثناء حذف الموظفين ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteError]);

  if (isFetching) return <Loading />;
  if (isError) return <Error />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">الأعضاء</h1>

      <div className="flex justify-between flex-wrap mb-4">
        <Input.Search
          placeholder="ابحث عن عضو..."
          onSearch={onSearch}
          className="mb-4 w-full max-w-md h-10"
          defaultValue={search}
          allowClear={true}
          onClear={() => setSearch("")}
        />

        {/* Add Button */}
        <Link
          to={"/employees/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
       bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
        >
          <PlusOutlined />
          <span>إضافة عضو</span>
        </Link>
      </div>

      {/* Selected Action Bar */}
      <SelectedActionsBar
        selectedCount={selectedList.length}
        onConfirmDelete={() => {
          deleteEmployees(selectedList);
        }}
        onClearSelection={() => {
          setSelectedList([]);
        }}
        deleting={deleting}
      />

      {/* Table */}
      <Table
        dataSource={data?.data}
        columns={columns}
        onRow={(record) => ({
          onClick: () => navigate(`employee-profile/${record.id}`),
        })}
        rowKey="id"
        pagination={tablePaginationConfig({
          total: data?.count,
          current: data?.page,
          onChange(page) {
            setPage(page);
          },
        })}
        bordered
        scroll={{ x: "max-content" }}
        className="clickable-table  calypso-header"
        rowSelection={rowSelection}
      />
    </>
  );
};

export default ClientsList;
