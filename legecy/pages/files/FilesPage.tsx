import {
  Card,
  Input,
  Button,
  Upload,
  message,
  Breadcrumb,
  Empty,
  Modal,
  Popconfirm,
  Select,
} from "antd";
import {
  FolderOpenOutlined,
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FolderAddOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { ItemType } from "antd/lib/breadcrumb/Breadcrumb";

type FileItem = {
  id: string;
  name: string;
  type: "file";
};

type FolderItem = {
  id: string;
  name: string;
  type: "folder";
  files: FileItem[];
};

type Item = FileItem | FolderItem;

const { Option } = Select;

const mockData: Item[] = [
  {
    id: "f1",
    name: "شؤون الموظفين",
    type: "folder",
    files: [
      { id: "f1-1", name: "تفاصيل أحمد.pdf", type: "file" },
      { id: "f1-2", name: "السجل المالي.xlsx", type: "file" },
    ],
  },
  {
    id: "f2",
    name: "الاجتماعات",
    type: "folder",
    files: [],
  },
  {
    id: "a1",
    name: "سياسات العمل.pdf",
    type: "file",
  },
];

const FilesPage = () => {
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [openPopConfirm, setOpenPopConfirm] = useState<boolean>(false);
  const [folderName, setFolderName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [breadCrumbsItems, setBreadCrumbsItems] = useState<ItemType[]>([
    {
      title: "الملفات",
    },
  ]);

  // sorting options
  const [sort, setSort] = useState("name");

  const handleChange = (value: string) => {
    setSort(value);
  };

  const itemsToShow = currentFolder ? currentFolder.files : mockData;

  const handleOpenFolder = (folder: FolderItem) => {
    setBreadCrumbsItems((old) => [...old, { title: folder.name }]);
    setCurrentFolder(folder);
  };
  const handleBack = () => {
    setBreadCrumbsItems((old) => [old[0]]);
    setCurrentFolder(null);
  };
  const handlePreview = (file: FileItem) => setPreviewFile(file);

  // Search Function
  const onSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    console.log("Creating folder:", folderName);
    // Add your async logic here
    setOpenPopConfirm(false);
    setFolderName("");
  };

  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">الملفات</h1>

      {/* Controls */}
      <div className="flex justify-between flex-wrap gap-4 mb-4">
        <Input
          placeholder="ابحث عن ملف أو مجلد..."
          prefix={<SearchOutlined />}
          onChange={(e) => onSearch(e.target.value)}
          className="mb-4 w-full max-w-md h-10"
        />

        <div className="flex gap-4 flex-wrap">
          {/* Create Folder Button */}
          <Popconfirm
            title={
              <div className="w-64">
                <p className="mb-2 font-semibold">أدخل اسم المجلد</p>
                <Input
                  placeholder="اسم المجلد"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full"
                />
              </div>
            }
            onConfirm={handleCreateFolder}
            onCancel={() => setOpenPopConfirm(false)}
            // open={openPopConfirm}
            icon={<FolderOpenOutlined className="text-blue-500" />}
            okText="إنشاء"
            cancelText="إلغاء"
          >
            <Button
              onClick={() => setOpenPopConfirm(true)}
              size="large"
              className="bg-blue-600 hover:bg-blue-500 border-none text-white"
              icon={<FolderAddOutlined />}
            >
              إنشاء مجلد
            </Button>
          </Popconfirm>

          {/* Add File Button */}
          <Upload
            beforeUpload={() => {
              message.success("تم رفع الملف)");
              return false;
            }}
            multiple
          >
            <Button
              icon={<UploadOutlined />}
              className="bg-blue-600 hover:bg-blue-500 border-none text-white"
              size="large"
            >
              رفع ملف
            </Button>
          </Upload>
        </div>
      </div>

      <div className="flex justify-between items-start flex-wrap my-6 gap-4">
        {/* Breadcrumb */}
        <div className="text-right">
          <Breadcrumb
            className="text-sm"
            items={breadCrumbsItems}
            itemRender={(route) => <span>{route.title}&nbsp;/</span>}
            separator={" "}
          />

          {currentFolder && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="mt-4"
            >
              الرجوع للمجلدات
            </Button>
          )}
        </div>

        {/* Sorting Options */}
        <div className="flex items-center gap-2">
          <SortAscendingOutlined className="text-lg text-gray-600" />
          <Select
            value={sort}
            onChange={handleChange}
            className="min-w-[160px]"
            size="middle"
            defaultValue={"name"}
          >
            <Option value="name">الاسم</Option>
            <Option value="date">تاريخ الإضافة</Option>
            <Option value="size">الحجم</Option>
          </Select>
        </div>
      </div>

      {/* Files and Folders Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {itemsToShow.length === 0 && (
          <div className="col-span-full">
            <Empty description="مجلد فارغ" />
          </div>
        )}

        {itemsToShow.map((item) =>
          item.type === "folder" ? (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md text-center"
              onClick={() => handleOpenFolder(item as FolderItem)}
            >
              <FolderOpenOutlined className="text-4xl text-yellow-500 mb-2" />
              <p className="font-semibold">{item.name}</p>
            </Card>
          ) : (
            <Card
              key={item.id}
              className="relative group text-center"
              actions={[
                <EyeOutlined key="view" onClick={() => handlePreview(item)} />,
                <DeleteOutlined key="delete" />,
              ]}
            >
              <FileOutlined className="text-4xl text-gray-500 mb-2" />
              <p className="font-semibold truncate">{item.name}</p>
            </Card>
          )
        )}
      </div>

      {/* File Preview Modal */}
      <Modal
        open={!!previewFile}
        onCancel={() => setPreviewFile(null)}
        footer={null}
        title={previewFile?.name}
      >
        <p>رابط التحميل</p>
      </Modal>
    </>
  );
};

export default FilesPage;
