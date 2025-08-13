// src/components/WorkEntityStats/WorkEntityCards.tsx
import React from "react";
import { Card, Typography } from "antd";
import {
  UserOutlined,
  BankOutlined,
  HomeOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { WorkEntity } from "@/types/workentity";

const { Title } = Typography;

type WorkEntityStat = WorkEntity & { clientCount: number };

interface Props {
  entities: WorkEntityStat[];
}

const ICONS = [
  <UserOutlined />,
  <BankOutlined />,
  <HomeOutlined />,
  <TeamOutlined />,
  <CrownOutlined />,
  <SafetyCertificateOutlined />,
  <FileTextOutlined />,
];

// Tailwind gradient color classes
const GRADIENTS = [
  "bg-gradient-to-r from-pink-500 to-red-500",
  "bg-gradient-to-r from-orange-400 to-yellow-400",
  "bg-gradient-to-r from-teal-500 to-emerald-500",
  "bg-gradient-to-r from-blue-500 to-indigo-500",
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-cyan-500 to-blue-500",
  "bg-gradient-to-r from-lime-500 to-green-500",
];

const WorkEntityCards: React.FC<Props> = ({ entities }) => {
  return (
    <div className="mt-16">
      <Title
        level={3}
        className="text-center mb-6 font-bold"
        style={{ color: "#333" }}
      >
        توزيع الأعضاء حسب جهة العمل
      </Title>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {entities.map((entity, index) => (
          <Card
            key={entity.id}
            className={`text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}
            styles={{
              body: {
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
            }}
            style={{ background: "transparent" }}
          >
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 text-2xl`}
            >
              {ICONS[index % ICONS.length]}
            </div>
            <div className="text-right flex-1 ml-4">
              <div className="text-2xl font-bold">{entity.clientCount}</div>
              <div className="text-sm opacity-80">{entity.name}</div>
            </div>
            <div
              className={`absolute inset-0 -z-10 rounded-xl ${
                GRADIENTS[index % GRADIENTS.length]
              }`}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkEntityCards;
