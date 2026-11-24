import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FaPills, FaPlus } from "react-icons/fa6";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import { IoAlertCircle, IoArrowBack } from "react-icons/io5";

const MedicineStock = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showMedForm, setShowMedForm] = useState(false);

  const navigate = useNavigate();

  const initialFormState = {
    drug_name: "",
    generic_name: "",
    category: "",
    unit: "",
    selling_price: "",
    reorder_level: 10,
    status: true,
  };

  const [medData, setMedData] = useState(initialFormState);

  const fetchMedicines = async () => {
    try {
      const res = await api.get("/medicines/");
      setMedicines(res.data);
    } catch (err) {
      setMessage({
        type: "error",
        text: "ไม่สามารถดึงข้อมูลยาได้ (Failed to load medicines.)",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/medicines/", medData);
      setMessage({ type: "success", text: "เพิ่มข้อมูลยาใหม่สำเร็จ!" });
      setShowMedForm(false);
      setMedData(initialFormState);
      fetchMedicines();
    } catch (err) {
      setMessage({
        type: "error",
        text: "ไม่สามารถเพิ่มข้อมูลยาได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const handleMedChange = (e) =>
    setMedData({ ...medData, [e.target.name]: e.target.value });

  const handleToggleForm = () => {
    setShowMedForm(!showMedForm);
    if (showMedForm) {
      setMedData(initialFormState);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <FaPills className="mr-3 text-blue-600 size-6" />
            จัดการคลังยา
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบจัดการฐานข้อมูลยาและเวชภัณฑ์
          </p>
        </div>
        <button
          onClick={handleToggleForm}
          className={`cursor-pointer flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-colors rounded-xl shadow-sm ${
            showMedForm
              ? "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showMedForm ? (
            <IoArrowBack />
          ) : (
            <>
              <FaPlus className="mr-2 size-4" /> เพิ่มข้อมูลยา
            </>
          )}
        </button>
      </div>

      {/* แจ้งเตือนสถานะ (Alert Message) */}
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

      {!showMedForm ? (
        // -----------------------------------------------------
        // Table Section (หน้าแสดงรายการยา)
        // -----------------------------------------------------
        <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-blue-100">
          <div className="flex items-center px-6 py-5 bg-white border-b border-blue-50">
            <h3 className="font-bold text-blue-900">
              ฐานข้อมูลยา
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b bg-slate-50 text-slate-700 border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">ชื่อยา</th>
                  <th className="px-6 py-4">หมวดหมู่</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-blue-600 animate-pulse font-medium"
                    >
                      กำลังโหลดข้อมูล (Loading...)
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-slate-500 bg-slate-50/50"
                    >
                      ไม่มีข้อมูลยาในระบบ
                    </td>
                  </tr>
                ) : (
                  medicines.map((m) => (
                    <tr
                      key={m.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4 font-bold text-blue-700">
                        {m.drug_name}{" "}
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          ({m.unit})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{m.category}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            m.status
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {m.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/medicines/${m.id}`)}
                          className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 shadow-sm"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // -----------------------------------------------------
        // Form Section (หน้าฟอร์มเพิ่มยาใหม่แบบ Inline)
        // -----------------------------------------------------
        <div className="p-6 bg-white border shadow-sm md:p-8 rounded-2xl border-blue-50">
          <div className="pb-4 mb-6 border-b border-blue-50">
            <h2 className="text-xl font-bold text-blue-900">
              ลงทะเบียนยาใหม่
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              บันทึกข้อมูลหลักของยาเข้าสู่ฐานข้อมูลระบบ
            </p>
          </div>

          <form
            onSubmit={handleMedSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5"
          >
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-sm font-bold text-slate-700">
                ชื่อยาทางการค้า *
              </label>
              <input
                type="text"
                name="drug_name"
                required
                value={medData.drug_name}
                onChange={handleMedChange}
                className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1.5 text-sm font-bold text-slate-700">
                ชื่อสามัญทางยา
              </label>
              <input
                type="text"
                name="generic_name"
                value={medData.generic_name || ""}
                onChange={handleMedChange}
                className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-bold text-slate-700">
                หมวดหมู่ *
              </label>
              <select
                name="category"
                required
                value={medData.category}
                onChange={handleMedChange}
                className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="" disabled>
                  -- เลือกหมวดหมู่ --
                </option>
                <option value="ยาแก้ปวด/ลดไข้">ยาแก้ปวด/ลดไข้</option>
                <option value="ยาปฏิชีวนะ">ยาปฏิชีวนะ</option>
                <option value="ยาแก้แพ้">ยาแก้แพ้</option>
                <option value="ยาระบบทางเดินอาหาร">ยาระบบทางเดินอาหาร</option>
                <option value="ยาระบบทางเดินหายใจ">ยาระบบทางเดินหายใจ</option>
                <option value="วิตามินและอาหารเสริม">
                  วิตามินและอาหารเสริม
                </option>
                <option value="เวชภัณฑ์">เวชภัณฑ์ (Medical Supplies)</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-bold text-slate-700">
                หน่วยนับ *
              </label>
              <select
                name="unit"
                required
                value={medData.unit}
                onChange={handleMedChange}
                className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="" disabled>
                  -- เลือกหน่วยนับ --
                </option>
                <option value="เม็ด">เม็ด (Tablet)</option>
                <option value="แคปซูล">แคปซูล (Capsule)</option>
                <option value="ขวด">ขวด (Bottle)</option>
                <option value="หลอด">หลอด (Tube)</option>
                <option value="แผง">แผง (Pack)</option>
                <option value="ซอง">ซอง (Sachet)</option>
                <option value="กล่อง">กล่อง (Box)</option>
                <option value="มิลลิลิตร">มิลลิลิตร (ml)</option>
                <option value="กรัม">กรัม (g)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-bold text-slate-700">
                ราคาขายต่อหน่วย *
              </label>
              <input
                type="number"
                step="0.01"
                name="selling_price"
                required
                value={medData.selling_price}
                onChange={handleMedChange}
                className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-bold text-slate-700">
                แจ้งเตือนสต็อกเหลือน้อย *
              </label>
              <input
                type="number"
                name="reorder_level"
                required
                value={medData.reorder_level}
                onChange={handleMedChange}
                className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3 pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleToggleForm}
                className="cursor-pointer px-6 py-2.5 text-sm font-medium transition-colors bg-white border rounded-xl text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="cursor-pointer px-6 py-2.5 text-sm font-bold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MedicineStock;
