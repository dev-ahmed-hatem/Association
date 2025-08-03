import { MdEditNote } from "react-icons/md";
import { NavLink } from "react-router";

const notes = [
  {
    id: 1,
    title: "اجتماع الفريق التقني",
    text: "تم مناقشة خطة تطوير الإصدار الجديد من التطبيق. تم تحديد الأولويات وإسناد المهام للمطورين.",
    time: "اليوم 09:30 صباحًا",
  },
  {
    id: 2,
    title: "مراجعة كود الواجهة الأمامية",
    text: "تم مراجعة الكود الجديد للوحة التحكم، وتمت الموافقة على دمجه بعد إجراء بعض التحسينات.",
    time: "أمس 04:15 مساءً",
  },
  {
    id: 3,
    title: "اختبار الأداء",
    text: "تم إجراء اختبارات الأداء على الخوادم، وتم تحديد بعض النقاط التي تحتاج إلى تحسين لتقليل زمن الاستجابة.",
    time: "أمس 11:45 صباحًا",
  },
  {
    id: 4,
    title: "تصميم جديد للموقع",
    text: "تم عرض التصميم الجديد لموقع الشركة، وتمت مناقشة الألوان والخطوط لتحسين تجربة المستخدم.",
    time: "الأسبوع الماضي",
  },
];

const LatestNotes = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg w-full mx-auto">
      <NavLink
        to={"/notes"}
        className="text-xl font-semibold text-white hover:underline
         mb-4 border-b flex items-center gap-2 bg-calypso-800 p-4"
      >
        <MdEditNote className="text-2xl" />
        المذكرات الأخيرة
      </NavLink>

      {/* Notes List */}
      <div className="space-y-5 p-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className=" even:bg-orange-100 odd:bg-orange-50 p-3 rounded-lg shadow-sm hover:bg-orange-300
            flex flex-col gap-3 border-s-8 border-s-calypso-700 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-calypso-800 truncate">
                {note.title}
              </h3>
            </div>
            <p className="text-gray-700 text-sm truncate">{note.text}</p>
            <div className="flex justify-between items-center text-gray-500 text-xs">
              <span>{note.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <NavLink
        to={"/notes"}
        className={
          "flex my-4 justify-center text-base text-gray-600 hover:text-orange"
        }
      >
        عرض جميع المذكرات
      </NavLink>
    </div>
  );
};

export default LatestNotes;
