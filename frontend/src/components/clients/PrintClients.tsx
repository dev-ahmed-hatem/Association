import { useLazyGetClientsQuery } from "@/app/api/endpoints/clients";
import { ControlsType } from "@/pages/clients/ClientsList";
import { useNotification } from "@/providers/NotificationProvider";
import { Client } from "@/types/client";
import { PrinterOutlined } from "@ant-design/icons";

interface PrintClientsProps {
  controls: ControlsType;
  search: string;
  searchType: "name__icontains" | "membership_number" | "phone_number";
}

export default function PrintClientsButton({
  controls,
  search,
  searchType,
}: PrintClientsProps) {
  const [getClients] = useLazyGetClientsQuery();
  const notification = useNotification();

  const handlePrint = async () => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) return;

    printWindow.document.write(`<html dir="rtl" lang="ar">
        <head>
          <title>قائمة الأعضاء</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.11.0/reset.min.css" />
          <style>
            body {
              font-family: "Cairo", sans-serif;
              padding: 40px;
              direction: rtl;
            }
            header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #ccc;
              padding: 1rem;
              margin-bottom: 10px;
              background-image: linear-gradient(to right, #2c2e83, #1a1a4c);
              color: white;
              border-radius: 8px;
            }
            .logo {
              height: 5rem;
              width: 5rem;
              border-radius: 50%;
              background-color: white;
            }
            h1 {
              margin: 0;
              font-size: 22px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              text-align: center;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 6px 8px;
            }
            th {
              background: #1a1a4c;
              color: white;
            }

            .spinner {
              border: 8px solid #f3f3f3;
              border-top: 8px solid #1a1a4c;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @media print {
              body {
                padding: 0;
              }
              th {
                background: #f0f0f0 !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div
            style="
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            "
          >
            <div class="spinner"></div>
          </div>
        </body>
      </html>`);

    const { data: clients, error } = await getClients({
      no_pagination: true,
      search,
      search_type: searchType,
      sort_by: controls?.sort_by,
      order: controls?.order === "descend" ? "-" : "",
      status: controls?.filters.name,
      rank: controls?.filters.rank,
      graduation_year: controls?.filters.seniority,
      entities: controls?.filters.work_entity,
    });

    if (error) {
      notification.error({ message: "حدث خطأ أثناء تصدير البيانات" });
      return;
    }

    // Write a temporary HTML doc
    printWindow.document.body.innerHTML = `
      <header>
        <div style="display:flex;align-items:center;gap:10px">
          <img src="/logo.jpeg" class="logo" alt="Logo" />
          <div>
            <h1>قائمة الأعضاء</h1>
          </div>
        </div>
        <div>${new Date().toLocaleDateString("en-CA")}</div>
      </header>

      <table>
        <thead>
          <tr>
            <th>م</th>
            <th>الرتبة</th>
            <th>اسم العضو</th>
            <th>رقم العضوية</th>
            <th>رقم الأقدمية</th>
            <th>تاريخ الاشتراك</th>
            <th>جهة العمل</th>
          </tr>
        </thead>
        <tbody>
          ${(clients as Client[])
            .map(
              (c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${c.rank ?? "-"}</td>
              <td>${c.name ?? "-"}</td>
              <td>${c.membership_number ?? "-"}</td>
              <td>${c.seniority ?? "-"}</td>
              <td>${c.subscription_date ?? "-"}</td>
              <td>${c.work_entity ?? "-"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <script>
        // window.onload = () => {
        //   window.print();
        //   window.onafterprint = () => window.close();
        // };
      </script>
    `;

    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
          hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
          transition-all duration-200"
    >
      <PrinterOutlined />
      <span>طباعة النتائج</span>
    </button>
  );
}
