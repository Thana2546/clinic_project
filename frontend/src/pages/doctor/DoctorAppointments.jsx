import { useState, useEffect } from "react";
import api from "../../api/axios";
import { TbCalendarClock } from "react-icons/tb";
import { FaUser, FaClock } from "react-icons/fa6";
import { FiFileText } from "react-icons/fi";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // เรียกใช้ API ใหม่ที่ดึงข้อมูล 7 วันล่วงหน้า
        const res = await api.get("/follow-ups/my_upcoming/");
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  console.log(appointments);

  // จัดกลุ่มข้อมูลตามวันที่ (Group by Date)
  const groupedAppointments = appointments.reduce((acc, curr) => {
    const date = curr.follow_up_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="p-10 text-center text-blue-600 animate-pulse font-medium">
        กำลังโหลดตารางนัดหมาย...
      </div>
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-center gap-4">
        <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
          <TbCalendarClock className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            ปฏิทินเวลางาน (ใน 7 วัน)
          </h1>
          <p className="text-sm text-slate-500">
            ตารางนัดหมายผู้ป่วยของคุณในช่วง 1 สัปดาห์ล่วงหน้า
          </p>
        </div>
      </div>

      {Object.keys(groupedAppointments).length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
          <TbCalendarClock className="text-slate-200 mb-4 size-10" />
          <p className="text-slate-500 font-bold text-lg">
            ไม่มีคิวนัดหมายในช่วง 7 วันนี้
          </p>
          <p className="text-slate-400 text-sm mt-1">
            คุณสามารถพักผ่อน หรือรับเฉพาะคิว Walk-in ได้เต็มที่
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* วนลูปแสดงข้อมูลแยกตามวัน */}
          {Object.keys(groupedAppointments).map((date) => {
            const dateObj = new Date(date);
            const isToday =
              new Date().toDateString() === dateObj.toDateString();

            return (
              <div
                key={date}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* หัวข้อแต่ละวัน */}
                <div
                  className={`p-4 border-b flex justify-between items-center ${isToday ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                >
                  <span className="text-lg font-bold">
                    {dateObj.toLocaleDateString("th-TH", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {isToday && (
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-black tracking-wider shadow-sm">
                      TODAY (วันนี้)
                    </span>
                  )}
                </div>

                {/* รายชื่อคนไข้ในวันนั้น */}
                <div className="divide-y divide-slate-100">
                  {groupedAppointments[date].map((app) => (
                    <div
                      key={app.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-blue-100 p-2.5 rounded-xl text-blue-600">
                          <FaUser className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {app.patient_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                              <FaClock className="text-slate-400 size-3" />
                              {app.follow_up_time
                                ? app.follow_up_time.substring(0, 5)
                                : "Anytime (ไม่ระบุเวลา)"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FiFileText className="text-slate-400 size-3" />
                              {app.note || "ไม่มีหมายเหตุ"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:text-right">
                        {app.status === "checked_in" && (
                          <span className="inline-block px-4 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                            เช็คอินแล้ว
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
