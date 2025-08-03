import { NavLink } from "react-router";
import Event from "./Event";

const LatestEvents = ({ dateSelected }: { dateSelected: string }) => {
  return (
    <div
      className="md:w-1/2 text-calypso-950 flex flex-col justify-between 
      gap-4 border-b pb-2"
    >
      <h1 className="border-b pb-2">
        مواعيد يوم: <span className="inline-block ms-1">{dateSelected}</span>
      </h1>
      <div className="events flex flex-col justify-between flex-2 gap-4">
        {/* <h1 className="text-center text-orange-600">لا توجد مواعيد</h1> */}

        <>
          <div className="events-wrapper flex flex-col gap-4">
            <Event category="اجتماع" title="شركة كفو" time="10:30 ص - 1:00 م" />
            <Event category="تسليم تكليف" title="اسم موظف" time="1:30 م" />
            <Event
              category="مراجعة مشروع"
              title="اسم مشروع"
              time="طوال اليوم"
            />
          </div>
          <div className="see-more text-center">
            <NavLink
              to={"/schedules"}
              className={"text-base text-gray-600 hover:text-orange"}
            >
              عرض جميع المواعيد
            </NavLink>
          </div>
        </>
      </div>
    </div>
  );
};

export default LatestEvents;
