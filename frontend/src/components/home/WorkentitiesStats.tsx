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
import { HomeStats } from "@/types/client";

const { Title } = Typography;

type WorkEntityStat = HomeStats["entities_count"];

interface Props {
  entities: WorkEntityStat;
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
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {entities.map((entity, index) => (
          <Card
            key={entity.id}
            className={`relative overflow-hidden text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300
            ${GRADIENTS[index % GRADIENTS.length]}`}
            styles={{
              body: {
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              },
            }}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-3xl mb-4">
              {ICONS[index % ICONS.length]}
            </div>

            {/* Text */}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold">{entity.count}</div>
              <div className="text-sm opacity-90 mt-1">{entity.name}</div>
            </div>

            {/* Gradient Background */}
            {/* <div
              className={`absolute inset-0 -z-10 rounded-2xl ${
                GRADIENTS[index % GRADIENTS.length]
              }`}
            /> */}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkEntityCards;
