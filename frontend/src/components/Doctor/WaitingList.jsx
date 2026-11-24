import { FaArrowRight } from "react-icons/fa";

const WaitingList = ({ queues, loading, activeQueue, handleCallPatient }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-blue-50 p-5 h-fit">
      <h2 className="font-bold text-blue-900 mb-4 border-b border-blue-100 pb-3 flex items-center">
        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
        คิวรอตรวจ
      </h2>
      {loading ? (
        <p className="text-sm text-blue-500 animate-pulse">
          กำลังโหลด...
        </p>
      ) : queues.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg">
          ไม่มีผู้ป่วยรอตรวจ
        </p>
      ) : (
        <ul className="space-y-3">
          {queues.map((q) => (
            <li
              key={q.id}
              className={`p-4 rounded-xl border transition-colors ${activeQueue?.id === q.id ? "bg-blue-50/80 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`font-bold ${activeQueue?.id === q.id ? "text-blue-700" : "text-blue-600"}`}
                  >
                    Queue: {q.queue_number}
                  </p>
                  <p className="font-semibold text-sm text-slate-800 mt-0.5">
                    {q.patient_name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize mt-1 inline-flex items-center px-2 py-0.5 bg-slate-100 rounded-md">
                    {q.status.replace("_", " ")}
                  </p>
                </div>
                {q.status === "waiting_doctor" && activeQueue?.id !== q.id && (
                  <button
                    onClick={() => handleCallPatient(q)}
                    className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                    title="เรียกผู้ป่วย"
                  >
                    <FaArrowRight className="size-3.5" />
                  </button>
                )}
                {q.status === "in_progress" && activeQueue?.id !== q.id && (
                  <button
                    onClick={() => handleCallPatient(q)}
                    className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200 transition-colors"
                  >
                    ทำต่อ (Resume)
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WaitingList;