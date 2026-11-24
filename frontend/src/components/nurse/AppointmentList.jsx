import { FaCalendarCheck, FaArrowRight } from "react-icons/fa";

const AppointmentList = ({
  appointments,
  loadingAppointments,
  handleCheckIn,
}) => {
  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-blue-100">
      <div className="flex items-center justify-between p-5 border-b bg-blue-50/50 border-blue-100">
        <h2 className="flex items-center font-bold text-blue-900">
          <FaCalendarCheck className="mr-3 text-blue-600 size-5" />
          การนัดหมายของวันนี้
        </h2>
        <span className="px-3 py-1.5 text-xs font-bold text-blue-800 bg-blue-100 border border-blue-200 rounded-lg shadow-sm">
          รอเช็คอิน {appointments.length} คิว
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-white border-b font-semibold text-slate-700 border-slate-200">
            <tr>
              <th className="px-6 py-4">ชื่อผู้ป่วย</th>
              <th className="px-6 py-4">แพทย์</th>
              <th className="px-6 py-4">เวลา</th>
              <th className="px-6 py-4">หมายเหตุ</th>
              <th className="px-6 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingAppointments ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 font-medium text-center text-blue-500 animate-pulse"
                >
                  กำลังโหลดข้อมูลการนัดหมาย...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-slate-500 bg-slate-50/50"
                >
                  ไม่มีคิวนัดหมายที่รอเช็คอินในวันนี้
                </td>
              </tr>
            ) : (
              appointments.map((app) => (
                <tr
                  key={app.id}
                  className="transition-colors hover:bg-blue-50/30"
                >
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {app.patient_name}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    นพ./พญ. {app.doctor_name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-700">
                    {app.follow_up_time
                      ? app.follow_up_time.substring(0, 5)
                      : "ไม่ระบุเวลา"}
                  </td>
                  <td className="px-6 py-4 text-xs truncate max-w-xs text-slate-500">
                    {app.note || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleCheckIn(app.id, app.patient_name)}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white transition-colors bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700"
                    >
                      เช็คอิน <FaArrowRight className="ml-1.5 size-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;