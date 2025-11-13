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
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: "Cairo", sans-serif;
              padding: 20px;
              direction: rtl;
            }

            header {
              display: flex;
              align-items: center;
              justify-content: center;
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
            header p {
              font-size: 20px;
            }
            h1 {
              margin: 0;
              font-size: 24px;
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

            footer {
              margin-top: 15px;
              border-top: 2px solid #ccc;
              padding: 10px 20px;
              font-size: 14px;
              color: #333;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
              background: #f5f5f5;
            }

            .footer-logo {
              display: flex;
              align-items: center;
              gap: 12px;
              color: #1a1a4c;
              font-weight: 800;
            }

            .footer-logo img {
              height: 3rem;
              width: 3rem;
              border-radius: 50%;
              border: 1px solid #1a1a4c;
            }

            .footer-text h3 {
              margin: 0;
              color: #1a1a4c;
              font-size: 16px;
            }

            .footer-text p {
              margin: 0;
              font-size: 13px;
              color: #666;
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
                /* background: #f0f0f0 !important; */
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
          <div style="display:flex;flex-direction:column;justify-content:center;padding-top:10px">
            <h1>جمعية التكافل الاجتماعي</h1>
            <p style="text-align:center;">قائمة الأعضاء</p>
          </div>
        </div>
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

      <footer>
        <div class="footer-logo">
          <img src="/logo.jpeg" alt="Logo" />
          <h3>جمعية التكافل الاجتماعي</h3>
        </div>
        <div class="footer-text">
          <p>إجمالي النتائج: ${(clients as Client[]).length}</p>
          <p>تاريخ المستخرج: ${new Date().toLocaleDateString("ar-EG")}</p>
        </div>
      </footer>
    `;

    printWindow.focus();
    printWindow.onafterprint = () => {
      setTimeout(() => {
        printWindow.close();
      }, 500); // Prevent asset flicker in parent
    };
    printWindow.print();
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
