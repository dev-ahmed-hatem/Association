import { Client } from "@/types/client";
import { PrinterOutlined } from "@ant-design/icons";

interface PrintClientProfileButtonProps {
  client: Client;
}

export default function PrintClientProfileButton({
  client,
}: PrintClientProfileButtonProps) {
  const handlePrintProfile = async () => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    // Temporary loading spinner
    printWindow.document.write(`
<html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ملف العضو - ${client.name}</title>
    <!-- Using Font Awesome for icons -->
    <link
      rel="preload"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
    <style>
      :root {
        --primary: #2c2e83;
        --primary-dark: #1a1a4c;
        --secondary: #4a6cf7;
        --light: #f8f9fa;
        --dark: #222;
        --gray: #6c757d;
        --success: #28a745;
        --border-radius: 12px;
        --box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "cairo", sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
        padding: 20px;
        direction: rtl;
        color: var(--dark);
        line-height: 1.6;
      }

      .container {
        max-width: 1000px;
        margin: 0 auto;
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
      header p {
        font-size: 20px;
      }
      h1 {
        margin: 0;
        font-size: 24px;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .logo {
        height: 80px;
        width: 80px;
        border-radius: 50%;
        background-color: white;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 50%;
      }

      .print-date {
        background: rgba(255, 255, 255, 0.2);
        padding: 8px 15px;
        border-radius: 30px;
        font-size: 0.9rem;
      }

      .profile-card {
        background: white;
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--box-shadow);
        margin-bottom: 30px;
      }

      .profile-header {
        background: linear-gradient(to left, #1d2f85, #3c4fb0);
        color: white;
        padding: 25px 30px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        align-items: center;
      }

      .profile-title {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .profile-icon {
        background: rgba(255, 255, 255, 0.2);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.7rem;
      }

      .profile-name h2 {
        margin-bottom: 5px;
      }

      .profile-name p {
        opacity: 0.9;
        font-size: 0.95rem;
      }

      .badge {
        background: white;
        color: var(--primary);
        padding: 8px 20px;
        border-radius: 8px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .badges {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .profile-content {
        padding: 30px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }

      .info-group {
        margin-bottom: 10px;
      }

      .info-group-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--primary);
        font-size: 1.1rem;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }

      .info-group-title i {
        font-size: 1.2rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .info-label {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--gray);
        font-weight: 500;
      }

      .info-value {
        font-weight: 600;
        color: var(--dark);
        text-align: left;
      }

      .notes-section {
        margin-top: 25px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: var(--border-radius);
        border-right: 4px solid var(--secondary);
      }

      .notes-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--primary);
        margin-bottom: 10px;
      }

      footer {
        background: white;
        border-radius: var(--border-radius);
        padding: 20px 30px;
        box-shadow: var(--box-shadow);
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 30px;
      }

      .footer-logo {
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: bold;
        color: var(--primary);
      }

      .footer-logo img {
        height: 50px;
        width: 50px;
        border-radius: 50%;
        border: 2px solid var(--primary);
      }

      .contact-info {
        text-align: left;
        font-size: 0.9rem;
        color: var(--gray);
      }

      @media (max-width: 768px) {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .margin-top {
          margin-top: 70px;
        }

        .profile-card {
          justify-content: flex-start;
        }

        .profile-header {
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 15px;
        }

        footer {
          gap: 15px;
          text-align: center;
        }

        .contact-info {
          text-align: center;
        }
      }

      @media print {
        body {
          padding: 0;
          background: white;
        }

        .container {
          max-width: 100%;
        }

        .profile-card {
          box-shadow: none;
          border: 1px solid #ddd;
        }
      }
    </style>
  </head>
  <body>
  
  <div class="container">
    <header>
      <div style="display:flex;align-items:center;gap:10px">
        <img src="/logo.jpeg" class="logo" alt="Logo" />
        <div style="display:flex;flex-direction:column;justify-content:center;padding-top:10px">
          <h1>جمعية التكافل الاجتماعي</h1>
          <p style="text-align:center;">ملف عضو</p>
        </div>
      </div>
    </header>

    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-title">
          <div class="profile-icon">
            <i class="far fa-user"></i>
          </div>
          <div class="profile-name">
            <h2>${client.rank ?? ""}/ ${client.name}</h2>
            <p>عضو في جمعية التكافل الاجتماعي</p>
          </div>
        </div>
        <div class="badges">
          <div class="badge">
            <i class="far fa-id-card"></i>
            رقم العضوية: ${client.membership_number ?? "-"}
          </div>
          <div class="badge">
            <i class="fas fa-star"></i>
            رقم الأقدمية: ${client.seniority ?? "-"}
          </div>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-grid">
          <div class="info-group">
            <div class="info-group-title">
              <i class="far fa-address-card"></i>
              <span>المعلومات الشخصية</span>
            </div>
          <div class="info-item">
            <span class="info-label">
              <i class="fas fa-phone-alt"></i>
              رقم الهاتف:
            </span>
            <span class="info-value">${client.phone_number ?? "-"}</span>
          </div>
            <div class="info-item">
              <span class="info-label">
                <i class="far fa-id-card"></i>
                الرقم القومي:
              </span>
              <span class="info-value">${client.national_id ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="far fa-calendar"></i>
                تاريخ الميلاد:
              </span>
              <span class="info-value">${client.birth_date ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="far fa-user"></i>
                العمر:
              </span>
              <span class="info-value">${client.age ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="far fa-heart"></i>
                الحالة الاجتماعية:
              </span>
              <span class="info-value">${client.marital_status ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-map-marker-alt"></i>
                محل الإقامة:
              </span>
              <span class="info-value">${client.residence ?? "-"}</span>
            </div>
          </div>

          <div class="info-group">
            <div class="info-group-title">
              <i class="fas fa-graduation-cap"></i>
              <span>المعلومات التعليمية</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-calendar-alt"></i>
                سنة التخرج:
              </span>
              <span class="info-value">${client.graduation_year ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-trophy"></i>
                الترتيب على الدفعة:
              </span>
              <span class="info-value">${client.class_rank ?? "-"}</span>
            </div>
          </div>

          <div class="info-group margin-top">
            <div class="info-group-title">
              <i class="fas fa-briefcase"></i>
              <span>المعلومات المهنية</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-building"></i>
                رقم الأقدمية:
              </span>
              <span class="info-value">${client.seniority ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-building"></i>
                جهة العمل:
              </span>
              <span class="info-value">${client.work_entity ?? "-"}</span>
            </div>
          </div>

          <div class="info-group">
            <div class="info-group-title">
              <i class="fas fa-file-contract"></i>
              <span>معلومات العضوية</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-users"></i>
                نوع العضوية:
              </span>
              <span class="info-value">${client.membership_type ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="far fa-calendar-check"></i>
                تاريخ الاشتراك:
              </span>
              <span class="info-value">${client.subscription_date ?? "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-money-bill-wave"></i>
                الرسوم:
              </span>
              <span class="info-value">${
                client.subscription_fee ?? "0"
              } ج.م</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-hand-holding-usd"></i>
                المدفوع مقدماً:
              </span>
              <span class="info-value">${client.prepaid ?? "0"} ج.م</span>
            </div>
          </div>
        </div>


        <div class="notes-section">
          <div class="notes-title">
            <i class="far fa-sticky-note"></i>
            <span>ملاحظات</span>
          </div>
          <p>${client.notes ?? "لا توجد ملاحظات"}</p>
        </div>
      </div>
    </div>

    <footer>
      <div class="footer-logo">
        <img src="/logo.jpeg" alt="Logo">
        <span>جمعية التكافل الاجتماعي</span>
      </div>
      <div class="contact-info">
        <p>تاريخ المستخرج: ${new Date().toLocaleDateString("ar-EG")}</p>
      </div>
    </footer>
  </div>
  <script>
    // Load Font Awesome properly before printing
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";

    fa.onload = () => {
      // Icons ready → print safely
      window.print();
    };

    document.head.appendChild(fa);

    window.onafterprint = () => {
      setTimeout(() => window.close(), 500);
    };
  </script>
  </body>
</html>

      `);

    // printWindow.focus();
    // printWindow.onafterprint = () => {
    //   setTimeout(() => printWindow.close(), 500);
    // };
    // printWindow.print();
  };

  return (
    <button
      onClick={handlePrintProfile}
      className="px-3 flex items-center text-white gap-2 rounded-lg
        bg-gradient-to-l from-indigo-800 to-indigo-600 hover:from-indigo-700
        hover:to-indigo-500 shadow-[0_2px_0_rgba(0,0,58,0.31)]
        transition-all duration-500"
    >
      <PrinterOutlined />
      <span>طباعة</span>
    </button>
  );
}
