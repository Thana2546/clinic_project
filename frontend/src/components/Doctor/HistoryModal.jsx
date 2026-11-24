import { FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const HistoryModal = ({
  showHistory,
  setShowHistory,
  patientHistory,
  activeQueue,
}) => {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-blue-100 bg-blue-50/50">
          <h2 className="text-xl font-bold text-blue-900 flex items-center">
            <FaHistory className="mr-3 text-blue-600" />
            ประวัติการรักษา : {activeQueue?.patient_name}
          </h2>
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-lg shadow-sm transition-colors"
          >
            <IoClose className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {patientHistory.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <p className="text-slate-500 font-medium">
                ไม่มีประวัติการรักษาเดิมของผู้ป่วยรายนี้
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {patientHistory.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-200 transition-colors"
                >
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      วันที่:{" "}
                      {new Date(record.created_at).toLocaleDateString("en-GB")}
                    </span>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                      แพทย์ {record.doctor_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    <div>
                      <p className="font-bold text-slate-700 mb-1.5 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>{" "}
                        อาการ (Symptoms)
                      </p>
                      <p className="text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg min-h-15">
                        {record.chief_complaint}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 mb-1.5 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>{" "}
                        การรักษา (Treatment)
                      </p>
                      <p className="text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg min-h-15">
                        {record.treatment}
                      </p>
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <p className="font-bold text-slate-700 mb-1.5 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>{" "}
                        การวินิจฉัยโรค (Diagnosis)
                      </p>
                      <ul className="text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-1">
                        {record.diagnoses?.map((d, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-slate-400 mr-2 mt-0.5">
                              •
                            </span>
                            <span>
                              {d.icd10_code ? (
                                <span className="font-semibold text-indigo-600 mr-1">
                                  [{d.icd10_code}]
                                </span>
                              ) : (
                                ""
                              )}
                              {d.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;