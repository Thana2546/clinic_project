import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FaReceipt } from "react-icons/fa6";
import { IoAlertCircle } from "react-icons/io5";
import { FaCheckCircle, FaRegCreditCard } from "react-icons/fa";
import { GiBanknote } from "react-icons/gi";

function BillingPayment() {
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [billData, setBillData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const queueRes = await api.get("/daily-queues/");
      setQueues(queueRes.data.filter((q) => q.status === "waiting_payment"));
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
    setBillData(null);
    setMessage({ type: "", text: "" });

    try {
      const recordRes = await api.get("/medical-records/");
      const record = recordRes.data.find((r) => r.daily_queue === queue.id);

      if (record) {
        const billRes = await api.post("/payments/", {
          medical_record_id: record.id,
        });
        setBillData(billRes.data);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "ไม่สามารถสร้างใบแจ้งหนี้ได้ กรุณาตรวจสอบว่าแพทย์บันทึกการรักษาครบถ้วนแล้ว",
      });
    }
  };

  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/payments/${billData.id}/pay/`, {
        payment_method: paymentMethod,
      });

      await api.patch(`/daily-queues/${selectedQueue.id}/change_status/`, {
        status: "completed",
      });

      setMessage({
        type: "success",
        text: `รับชำระเงินจำนวน ฿${billData.total_amount} เรียบร้อยแล้ว! เสร็จสิ้นขั้นตอนการรับบริการ`,
      });
      setBillData(null);
      setSelectedQueue(null);
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: "การชำระเงินล้มเหลว (Payment failed.)",
      });
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
            <FaReceipt className="mr-3 text-blue-600 size-6" /> จุดชำระเงิน
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบการเงิน ออกใบแจ้งหนี้ และรับชำระเงินค่ารักษาพยาบาล
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
            <IoAlertCircle className="mr-2 size-5" />
          ) : (
            <FaCheckCircle className="mr-2 size-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ฝั่งซ้าย: คิวรอชำระเงิน */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-blue-50 p-5 h-fit">
          <h2 className="font-bold text-blue-900 mb-4 border-b border-blue-100 pb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            คิวรอชำระเงิน (Waiting for Payment)
          </h2>
          {loading ? (
            <p className="text-sm text-blue-500 animate-pulse">กำลังโหลด...</p>
          ) : queues.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg">
              ไม่มีผู้ป่วยรอชำระเงิน
            </p>
          ) : (
            <ul className="space-y-3">
              {queues.map((q) => (
                <li
                  key={q.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
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

        {/* ฝั่งขวา: รายละเอียดใบแจ้งหนี้ */}
        <div className="lg:col-span-2">
          {billData ? (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
              {/* Header ยอดรวม */}
              <div className="bg-blue-600 text-white p-8 text-center border-b border-blue-700">
                <h3 className="text-sm font-semibold text-blue-100 mb-2 uppercase tracking-wider">
                  ยอดชำระสุทธิ (Total Amount Due)
                </h3>
                <p className="text-5xl font-bold">
                  <span className="text-blue-200 mr-1 text-4xl">฿</span>
                  {parseFloat(billData.total_amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="p-6 md:p-8">
                <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-3 mb-5">
                  รายละเอียดค่าใช้จ่าย (Invoice Details)
                </h4>

                {/* ตารางแสดงรายการ */}
                <ul className="space-y-4 text-sm mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <li className="flex justify-between text-slate-600">
                    <span>ค่าธรรมเนียมแพทย์ (Doctor Fee)</span>
                    <span className="font-medium text-slate-800">
                      ฿ {parseFloat(billData.doctor_fee).toFixed(2)}
                    </span>
                  </li>

                  {billData.items.map(
                    (item) =>
                      item.description !== "Doctor Fee" && (
                        <li
                          key={item.id}
                          className="flex justify-between text-slate-600"
                        >
                          <span>{item.description}</span>
                          <span className="font-medium text-slate-800">
                            ฿ {parseFloat(item.amount).toFixed(2)}
                          </span>
                        </li>
                      ),
                  )}

                  <li className="flex justify-between border-t border-slate-200 pt-4 mt-2 font-bold text-slate-800 text-base">
                    <span>รวมทั้งสิ้น (Total)</span>
                    <span className="text-blue-700">
                      ฿ {parseFloat(billData.total_amount).toFixed(2)}
                    </span>
                  </li>
                </ul>

                {/* เลือกช่องทางการชำระเงิน */}
                <div className="mb-8">
                  <h4 className="font-bold text-slate-700 mb-3 text-sm">
                    เลือกช่องทางการชำระเงิน (Select Payment Method)
                  </h4>
                  <div className="flex gap-4">
                    <label
                      className={`flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors shadow-sm ${
                        paymentMethod === "cash"
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="cash"
                        className="hidden"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                      />
                      <GiBanknote className="size-8 mb-2" />
                      <span className="font-bold text-sm">เงินสด (Cash)</span>
                    </label>
                    <label
                      className={`flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors shadow-sm ${
                        paymentMethod === "transfer"
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="transfer"
                        className="hidden"
                        checked={paymentMethod === "transfer"}
                        onChange={() => setPaymentMethod("transfer")}
                      />
                      <FaRegCreditCard className="size-8 mb-2" />
                      <span className="font-bold text-sm">
                        โอนเงิน (Transfer)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-6">
                  <button
                    onClick={handlePay}
                    disabled={isSubmitting}
                    className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-700 font-bold flex items-center transition-colors w-full justify-center md:w-auto shadow-sm disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      "กำลังดำเนินการ (Processing)..."
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2 size-5" />{" "}
                        ยืนยันการรับชำระเงิน (Confirm Receipt)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-300 border-dashed p-10 flex flex-col items-center justify-center h-full min-h-100">
              <div className="p-5 bg-white rounded-full shadow-sm mb-5">
                <FaReceipt className="text-blue-300 size-10" />
              </div>
              <p className="text-slate-600 font-bold text-lg mb-2">
                ยังไม่ได้เลือกผู้ป่วย
              </p>
              <p className="text-slate-500 text-sm">
                กรุณาเลือกรายชื่อผู้ป่วยจากคิวด้านซ้ายมือเพื่อตรวจสอบใบแจ้งหนี้
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingPayment;