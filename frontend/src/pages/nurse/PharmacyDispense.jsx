import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FaPills } from "react-icons/fa6";
import { IoAlertCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";

function PharmacyDispense() {
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [prescription, setPrescription] = useState(null);

  const [checkedItems, setCheckedItems] = useState({});

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const queueRes = await api.get("/daily-queues/");
      setQueues(queueRes.data.filter((q) => q.status === "waiting_medicine"));
    } catch (err) {
      setMessage({
        type: "error",
        text: "ไม่สามารถโหลดข้อมูลคิวได้ (Failed to load queues.)",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectQueue = async (queue) => {
    setSelectedQueue(queue);
    setPrescription(null);
    setCheckedItems({});
    setMessage({ type: "", text: "" });

    try {
      const recordRes = await api.get("/medical-records/");
      const record = recordRes.data.find((r) => r.daily_queue === queue.id);

      if (record) {
        const presRes = await api.get("/prescriptions/");
        const pres = presRes.data.find(
          (p) => p.medical_record === record.id && p.status === "pending",
        );

        setPrescription(pres);

        if (pres && pres.items) {
          const initialCheckState = {};
          pres.items.forEach((item) => {
            initialCheckState[item.id] = false;
          });
          setCheckedItems(initialCheckState);
        }

        if (!pres) {
          setMessage({
            type: "error",
            text: "ไม่พบรายการสั่งจ่ายยาที่รอการดำเนินการสำหรับผู้ป่วยรายนี้",
          });
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งยา",
      });
    }
  };

  console.log(prescription)

  // ฟังก์ชันจัดการตอนติ๊กถูก
  const handleToggleCheck = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // เช็กว่าติ๊กครบทุกช่องหรือยัง
  const isAllChecked =
    prescription &&
    prescription.items &&
    Object.values(checkedItems).length > 0 &&
    Object.values(checkedItems).every((status) => status === true);

  const handleDispense = async () => {
    // ป้องกันการกดยืนยันถ้ายังเช็คไม่ครบ
    if (!isAllChecked) return;

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post(`/prescriptions/${prescription.id}/dispense/`);

      await api.patch(`/daily-queues/${selectedQueue.id}/change_status/`, {
        status: "waiting_payment",
      });

      setMessage({
        type: "success",
        text: "จ่ายยาและตัดสต็อกเรียบร้อยแล้ว! ส่งผู้ป่วยไปยังจุดชำระเงิน",
      });
      setPrescription(null);
      setSelectedQueue(null);
      setCheckedItems({});
      fetchData();
    } catch (err) {
      const errorText =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "เกิดข้อผิดพลาด ไม่สามารถจ่ายยาได้";
      setMessage({ type: "error", text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <FaPills className="mr-3 text-blue-600 size-6" /> จุดจ่ายยา
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ตรวจสอบความถูกต้อง (Checklist) และตัดสต็อกอัตโนมัติ
          </p>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div
          className={`flex items-center p-4 border rounded-xl shadow-sm ${
            message.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {message.type === "error" ? (
            <IoAlertCircle className="mr-2 size-5 shrink-0" />
          ) : (
            <FaCheckCircle className="mr-2 size-5 shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ฝั่งซ้าย: คิวรอรับยา */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-blue-50 p-5 h-fit">
          <h2 className="font-bold text-blue-900 mb-4 border-b border-blue-100 pb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            คิวรอรับยา (Waiting for Medicine)
          </h2>
          {loading ? (
            <p className="text-sm text-blue-500 animate-pulse">กำลังโหลด...</p>
          ) : queues.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg">
              ไม่มีผู้ป่วยรอรับยา
            </p>
          ) : (
            <ul className="space-y-3">
              {queues.map((q) => (
                <li
                  key={q.id}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                    selectedQueue?.id === q.id
                      ? "bg-blue-50/80 border-blue-200 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => handleSelectQueue(q)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className={`font-bold ${selectedQueue?.id === q.id ? "text-blue-700" : "text-blue-600"}`}
                      >
                        Queue: {q.queue_number}
                      </p>
                      <p className="font-semibold text-sm text-slate-800 mt-0.5">
                        {q.patient_name}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ฝั่งขวา: รายละเอียดการจ่ายยา */}
        <div className="lg:col-span-2">
          {selectedQueue && prescription ? (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
              <div className="bg-blue-50/80 p-5 border-b border-blue-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-blue-900">
                    รายการจัดยา (Checklist)
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-semibold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-100 shadow-sm">
                      Queue: {selectedQueue.queue_number}
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      แพทย์ผู้สั่ง: นพ./พญ. {prescription.doctor_name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* เปลี่ยนตารางเป็นการ์ด Checkbox เพื่อให้กดง่ายขึ้น */}
                <div className="space-y-4 mb-8">
                  {prescription.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheck(item.id)}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                        checkedItems[item.id]
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <div className="mr-5">
                        {/* Checkbox Icon */}
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded border-2 transition-colors ${
                            checkedItems[item.id]
                              ? "bg-emerald-500 border-emerald-500"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {checkedItems[item.id] && (
                            <FaCheckCircle className="text-white size-4" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p
                            className={`font-bold text-lg ${checkedItems[item.id] ? "text-emerald-900" : "text-blue-800"}`}
                          >
                            {item.medicine_name}
                          </p>
                          <p className="text-slate-600 text-sm mt-0.5">
                            วิธีใช้:{" "}
                            <span className="font-semibold text-slate-800">
                              {item.dosage} {item.unit} {item.frequency}
                            </span>
                            {item.instruction && (
                              <span className="italic ml-2 text-slate-500">
                                ({item.instruction})
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-center">
                          <span
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-bold text-lg border ${
                              checkedItems[item.id]
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-blue-50 text-blue-800 border-blue-100"
                            }`}
                          >
                            จ่าย {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-slate-100 gap-4">
                  <div className="text-sm font-semibold">
                    <span className="text-slate-500 mr-2">
                      สถานะการตรวจสอบ:
                    </span>
                    <span
                      className={
                        isAllChecked ? "text-emerald-600" : "text-amber-600"
                      }
                    >
                      {Object.values(checkedItems).filter((v) => v).length} /{" "}
                      {prescription.items.length} รายการ
                    </span>
                  </div>

                  <button
                    onClick={handleDispense}
                    disabled={isSubmitting || !isAllChecked}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center transition-all shadow-sm ${
                      !isAllChecked
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
                    }`}
                  >
                    {isSubmitting ? (
                      "กำลังดำเนินการ..."
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2 size-5" />{" "}
                        ยืนยันการจ่ายยาและตัดสต็อก
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedQueue && !prescription ? (
            <div className="bg-amber-50 p-8 rounded-2xl text-center text-amber-700 border border-amber-200 flex flex-col items-center shadow-sm">
              <IoAlertCircle className="size-10 mb-3 text-amber-500" />
              <p className="font-semibold text-lg">ไม่พบข้อมูลใบสั่งยา</p>
              <p className="text-sm mt-1 opacity-80">
                กำลังค้นหาประวัติ หรือ ผู้ป่วยรายนี้ไม่ได้รับการสั่งจ่ายยา
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-10 flex flex-col items-center justify-center h-full min-h-100">
              <div className="p-5 bg-white rounded-full shadow-sm mb-5">
                <FaPills className="text-blue-300 size-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-600 mb-2">
                ยังไม่ได้เลือกผู้ป่วย
              </h2>
              <p className="text-slate-500 font-medium">
                กรุณาเลือกรายชื่อผู้ป่วยจากคิวด้านซ้ายมือเพื่อทำการจ่ายยา
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PharmacyDispense;