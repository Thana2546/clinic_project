import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FiActivity } from "react-icons/fi";
import { IoAlertCircle } from "react-icons/io5";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { FaClipboardList, FaUser, FaTrashCan } from "react-icons/fa6";

function QueueVitals() {
  const [queues, setQueues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialVitals = {
    weight: "",
    height: "",
    systolic_bp: "",
    diastolic_bp: "",
    temperature: "",
    symptoms: "",
  };

  const [vitalsData, setVitalsData] = useState(initialVitals);

  const fetchQueues = async () => {
    try {
      const res = await api.get("/daily-queues/");
      setQueues(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "ไม่สามารถโหลดข้อมูลคิวได้" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAvailability = async () => {
    try {
      const [usersRes, queuesRes] = await Promise.all([
        api.get("/users/"),
        api.get("/daily-queues/"),
      ]);

      const doctorList = usersRes.data.filter(
        (user) => user.role === "doctor" && user.is_active,
      );

      const activeQueues = queuesRes.data.filter((queue) =>
        ["waiting_doctor", "in_progress"].includes(queue.status),
      );

      const doctorsWithLoad = doctorList.map((doctor) => {
        const load = activeQueues.filter(
          (queue) => queue.doctor === doctor.id,
        ).length;

        return { ...doctor, load };
      });

      doctorsWithLoad.sort((a, b) => a.load - b.load);
      setDoctors(doctorsWithLoad);
    } catch (err) {
      console.error("ไม่สามารถโหลดข้อมูลแพทย์ได้", err);
    }
  };

  useEffect(() => {
    const loadData = () => {
      fetchQueues();
      fetchDoctorsAvailability();
    };

    loadData();

    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = async (queueId) => {
    try {
      await api.patch(`/daily-queues/${queueId}/change_status/`, {
        status: "waiting_vitals",
      });

      fetchQueues();
    } catch (err) {
      setMessage({ type: "error", text: "ไม่สามารถอัปเดตสถานะคิวได้" });
    }
  };

  const handleCancelQueue = async (queueId, patientName) => {
    const confirmCancel = window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคิวของ ${patientName}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
    );

    if (confirmCancel) {
      try {
        await api.patch(`/daily-queues/${queueId}/change_status/`, {
          status: "cancelled",
        });

        setMessage({
          type: "success",
          text: `ยกเลิกคิวของ ${patientName} เรียบร้อยแล้ว`,
        });

        if (selectedQueue?.id === queueId) {
          setSelectedQueue(null);
        }

        fetchQueues();
      } catch (err) {
        setMessage({ type: "error", text: "ยกเลิกคิวไม่สำเร็จ" });
      }
    }
  };

const handleSelectQueue = (queue) => {
    setSelectedQueue(queue);
    setVitalsData(initialVitals);
    
    if (queue.doctor) {
        setSelectedDoctor(queue.doctor);
    } else {
        setSelectedDoctor("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setVitalsData({
      ...vitalsData,
      [name]: value,
    });
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    if (!selectedDoctor) {
      setMessage({
        type: "error",
        text: "กรุณาเลือกแพทย์ก่อนส่งต่อผู้ป่วย",
      });

      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/vitals/", {
        patient: selectedQueue.patient,
        daily_queue: selectedQueue.id,
        ...vitalsData,
      });

      await api.patch(`/daily-queues/${selectedQueue.id}/change_status/`, {
        status: "waiting_doctor",
        doctor_id: selectedDoctor,
      });

      setMessage({
        type: "success",
        text: "บันทึกสัญญาณชีพและส่งต่อผู้ป่วยเรียบร้อยแล้ว",
      });

      setSelectedQueue(null);
      fetchQueues();
      fetchDoctorsAvailability();
    } catch (err) {
      const errorData = err.response?.data;

      const errorMsg =
        errorData?.blood_pressure?.[0] ||
        errorData?.blood_pressure ||
        errorData?.error ||
        errorData?.detail ||
        "เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูลอีกครั้ง";

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      waiting: {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        label: "รอเรียกคิว",
      },
      waiting_vitals: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "รอซักประวัติ",
      },
      waiting_doctor: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "รอพบแพทย์",
      },
      in_progress: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "กำลังตรวจ",
      },
      waiting_payment: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        label: "รอชำระเงิน",
      },
      waiting_medicine: {
        color: "bg-teal-100 text-teal-800 border-teal-200",
        label: "รอรับยา",
      },
      completed: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        label: "เสร็จสิ้น",
      },
      cancelled: {
        color: "bg-rose-100 text-rose-800 border-rose-200",
        label: "ยกเลิกคิว",
      },
    };

    const config = statusMap[status] || {
      color: "bg-slate-100 text-slate-800 border-slate-200",
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* ส่วนหัว */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <FiActivity className="mr-3 text-blue-600 size-6" />
            จุดซักประวัติและบันทึกสัญญาณชีพ
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบจัดการคิว บันทึกสัญญาณชีพ และส่งต่อแพทย์
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`flex items-center p-4 border rounded-xl shadow-sm ${
            message.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {message.type === "error" ? (
            <IoAlertCircle className="mr-2 size-5" />
          ) : (
            <FaCheckCircle className="mr-2 size-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ตารางคิวผู้ป่วย */}
        <div className="lg:col-span-3 overflow-hidden bg-white border shadow-sm rounded-2xl border-blue-50 h-fit">
          <div className="flex items-center p-5 bg-white border-b border-blue-50">
            <FaClipboardList className="mr-3 text-blue-500 size-5" />
            <h2 className="font-bold text-blue-900">คิวทั้งหมดวันนี้</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">หมายเลขคิว</th>
                  <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 font-semibold">สถานะ</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    การจัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 font-medium text-center text-blue-600 animate-pulse"
                    >
                      กำลังโหลดข้อมูลคิว...
                    </td>
                  </tr>
                ) : queues.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-slate-500 bg-slate-50/50"
                    >
                      ไม่มีคิวผู้ป่วยในขณะนี้
                    </td>
                  </tr>
                ) : (
                  queues.map((q) => (
                    <tr
                      key={q.id}
                      className={`transition-colors ${
                        selectedQueue?.id === q.id
                          ? "bg-blue-50/60"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-blue-700">
                        {q.queue_number}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {q.patient_name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          รหัสผู้ป่วย (HN): {q.hn_number}
                        </p>
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(q.status)}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {q.status === "waiting" && (
                            <button
                              onClick={() => handleCallPatient(q.id)}
                              className="px-3 py-1.5 text-xs font-bold text-sky-700 transition-colors bg-sky-50 border border-sky-100 rounded-lg hover:bg-sky-100 shadow-sm"
                            >
                              เรียกซักประวัติ
                            </button>
                          )}

                          {q.status === "waiting_vitals" && (
                            <button
                              onClick={() => handleSelectQueue(q)}
                              className={`flex items-center px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg shadow-sm ${
                                selectedQueue?.id === q.id
                                  ? "bg-white text-blue-600 border-blue-200"
                                  : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              บันทึกสัญญาณชีพ
                              <FaArrowRight className="ml-1.5 size-3" />
                            </button>
                          )}

                          {!["completed", "cancelled"].includes(q.status) && (
                            <button
                              onClick={() =>
                                handleCancelQueue(q.id, q.patient_name)
                              }
                              className="p-1.5 text-rose-500 transition-colors bg-white border border-rose-100 rounded-lg hover:bg-rose-50 shadow-sm"
                              title="ยกเลิกคิว"
                            >
                              <FaTrashCan className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ฟอร์มบันทึกสัญญาณชีพ */}
        <div className="lg:col-span-2">
          {selectedQueue ? (
            <div className="sticky p-6 bg-white border shadow-sm top-6 rounded-2xl border-blue-50">
              {/* ข้อมูลผู้ป่วยที่เลือก */}
              <div className="flex items-center p-4 mb-5 border shadow-sm bg-blue-50/50 text-blue-900 rounded-xl border-blue-100">
                <div className="flex items-center justify-center w-10 h-10 mr-3 text-blue-600 bg-white rounded-full shadow-sm">
                  <FaUser className="size-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    คิวหมายเลข {selectedQueue.queue_number}
                  </p>
                  <h3 className="text-base font-bold text-slate-800 mt-0.5">
                    {selectedQueue.patient_name}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSubmitVitals} className="space-y-4">
                {/* เลือกแพทย์ */}
                <div className="p-4 mb-5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <label className="block mb-2 text-sm font-bold text-indigo-900">
                    เลือกแพทย์ผู้ทำการตรวจ{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <select
                    required
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 shadow-sm"
                  >
                    <option value="" disabled>
                      -- กรุณาเลือกแพทย์ --
                    </option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title}
                        {doc.first_name} {doc.last_name}
                        {doc.load === 0
                          ? " (คิวว่าง)"
                          : ` (รอตรวจ: ${doc.load} คิว)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* น้ำหนักและส่วนสูง */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">
                      น้ำหนัก (กิโลกรัม)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      required
                      value={vitalsData.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">
                      ส่วนสูง (เซนติเมตร)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      required
                      value={vitalsData.height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">
                      ความดันตัวบน
                    </label>
                    <input
                      type="number"
                      name="systolic_bp"
                      required
                      value={vitalsData.systolic_bp}
                      onChange={handleInputChange}
                      placeholder="เช่น 120"
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-bold text-slate-700">
                      ความดันตัวล่าง
                    </label>
                    <input
                      type="number"
                      name="diastolic_bp"
                      required
                      value={vitalsData.diastolic_bp}
                      onChange={handleInputChange}
                      placeholder="เช่น 80"
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* อุณหภูมิ */}
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-700">
                    อุณหภูมิ (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    required
                    value={vitalsData.temperature}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                {/* อาการเบื้องต้น */}
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-700">
                    อาการเบื้องต้นที่มาพบแพทย์
                  </label>
                  <textarea
                    rows="3"
                    name="symptoms"
                    required
                    value={vitalsData.symptoms}
                    onChange={handleInputChange}
                    placeholder="ระบุอาการ..."
                    className="w-full px-3 py-2 text-sm border rounded-lg resize-none bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  ></textarea>
                </div>

                {/* ปุ่มยกเลิกและบันทึก */}
                <div className="flex gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedQueue(null)}
                    className="w-1/3 py-2.5 text-sm font-medium transition-colors bg-white border rounded-xl text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedDoctor}
                    className={`w-2/3 py-2.5 text-sm font-bold text-white transition-colors rounded-xl shadow-sm ${
                      !selectedDoctor || isSubmitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "ส่งต่อให้แพทย์ตรวจ"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-100 text-center bg-slate-50 border border-slate-300 border-dashed rounded-2xl">
              <div className="p-4 mb-4 bg-white rounded-full shadow-sm">
                <FiActivity className="text-blue-300 size-8" />
              </div>
              <p className="font-bold text-slate-600 mb-1">
                ยังไม่ได้เลือกคิวผู้ป่วย
              </p>
              <p className="text-sm font-medium text-slate-500">
                กรุณาเลือกผู้ป่วยจากตารางด้านซ้าย <br />
                เพื่อบันทึกการซักประวัติและสัญญาณชีพ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueueVitals;