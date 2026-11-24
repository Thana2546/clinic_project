import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { LuPackagePlus } from "react-icons/lu";
import { FaArrowLeft, FaSave, FaCheckCircle } from "react-icons/fa";
import { FaPills, FaClock } from "react-icons/fa6";
import { IoAlertCircle } from "react-icons/io5";

function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [batches, setBatches] = useState([]);
  const [showBatchForm, setShowBatchForm] = useState(false);

  const [medData, setMedData] = useState({
    drug_name: "",
    generic_name: "",
    category: "",
    unit: "",
    selling_price: "",
    reorder_level: "",
    status: true,
  });

  const [batchData, setBatchData] = useState({
    batch_number: "",
    quantity: "",
    expiry_date: "",
    cost_price: "",
  });

  const fetchDetail = async () => {
    try {
      const medRes = await api.get(`/medicines/${id}/`);
      setMedData(medRes.data);
      const batchRes = await api.get(`/medicine-batches/?medicine=${id}`);
      setBatches(batchRes.data);
    } catch (err) {
      alert("ไม่พบข้อมูลยา");
      navigate("/admin/medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleMedUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/medicines/${id}/`, medData);
      setMessage({
        type: "success",
        text: "อัปเดตข้อมูลยาสำเร็จ!",
      });
    } catch (err) {
      setMessage({ type: "error", text: "ไม่สามารถอัปเดตข้อมูลยาได้" });
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/medicine-batches/", { ...batchData, medicine: id });
      setMessage({ type: "success", text: "เพิ่มล็อตยาใหม่เข้าคลังสำเร็จ!" });
      setShowBatchForm(false);
      setBatchData({
        batch_number: "",
        quantity: "",
        expiry_date: "",
        cost_price: "",
      });
      fetchDetail();
    } catch (err) {
      let errorText = "ไม่สามารถเพิ่มล็อตยาได้";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorText = data;
        } else if (data.detail || data.error) {
          errorText = data.detail || data.error;
        } else {
          const messages = Object.values(data).flat();
          if (messages.length > 0) {
            errorText = messages.join(" / ");
          }
        }
      }

      setMessage({ type: "error", text: errorText });
    }
  };

  const handleMedChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setMedData({ ...medData, [e.target.name]: value });
  };

  const handleBatchChange = (e) =>
    setBatchData({ ...batchData, [e.target.name]: e.target.value });

  const isExpired = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate <= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="font-medium text-blue-600 animate-pulse">
          กำลังโหลดรายละเอียด...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex items-center p-6 space-x-4 bg-white border shadow-sm rounded-2xl border-blue-50">
        <button
          onClick={() => navigate("/admin/medicines")}
          className="p-2 transition-colors bg-white border rounded-lg shadow-sm text-slate-500 border-slate-200 hover:bg-slate-50"
        >
          <FaArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="flex items-center text-2xl font-bold text-blue-900">
            <FaPills className="mr-3 text-blue-600 size-6" />
            รายละเอียดของยา
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {medData.drug_name}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Edit Medicine Data */}
        <div className="p-6 bg-white border shadow-sm lg:col-span-1 rounded-2xl border-blue-50">
          <h2 className="flex items-center pb-3 mb-5 font-bold border-b text-blue-900 border-blue-100">
            <FaSave className="mr-2 text-blue-500" /> ข้อมูลหลักของยา
          </h2>
          <form onSubmit={handleMedUpdate} className="space-y-5">
            <div>
              <label className="flex items-center p-4 space-x-3 font-bold transition-colors cursor-pointer text-blue-900 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50">
                <input
                  type="checkbox"
                  name="status"
                  checked={medData.status}
                  onChange={handleMedChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>
                  เปิดใช้งานยาตัวนี้{" "}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    (Active Status)
                  </span>
                </span>
              </label>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                ชื่อยาทางการค้า *
              </label>
              <input
                type="text"
                name="drug_name"
                required
                value={medData.drug_name}
                onChange={handleMedChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                ชื่อสามัญทางยา
              </label>
              <input
                type="text"
                name="generic_name"
                value={medData.generic_name || ""}
                onChange={handleMedChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                หมวดหมู่ *
              </label>
              <select
                name="category"
                required
                value={medData.category}
                onChange={handleMedChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
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

            {/* Unit Dropdown */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                หน่วยนับ *
              </label>
              <select
                name="unit"
                required
                value={medData.unit}
                onChange={handleMedChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
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
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                ราคาขายต่อหน่วย *
              </label>
              <input
                type="number"
                step="0.01"
                name="selling_price"
                required
                value={medData.selling_price}
                onChange={handleMedChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                แจ้งเตือนเมื่อสต็อกเหลือน้อยกว่า *
              </label>
              <input
                type="number"
                name="reorder_level"
                required
                value={medData.reorder_level}
                onChange={handleMedChange}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="cursor-pointer flex items-center justify-center w-full px-4 py-2.5 font-bold text-white transition-colors bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700"
              >
                <FaSave className="mr-2" /> บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </div>

        {/* 2. Stock & Batches */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-blue-50">
            <div className="flex items-center justify-between p-5 bg-white border-b border-blue-50">
              <h2 className="flex items-center font-bold text-blue-900">
                <FaClock className="mr-2 text-blue-500 size-4" />{" "}
                ประวัติการรับเข้าคลัง
              </h2>
              <button
                onClick={() => setShowBatchForm(!showBatchForm)}
                className={`cursor-pointer flex items-center px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm rounded-xl ${showBatchForm ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {showBatchForm ? (
                  "ยกเลิก"
                ) : (
                  <>
                    <LuPackagePlus className="mr-2 size-4" /> รับยาล็อตใหม่
                  </>
                )}
              </button>
            </div>

            {/* ฟอร์มรับล็อตใหม่ (Inline) */}
            {showBatchForm && (
              <div className="p-5 border-b bg-emerald-50/50 border-emerald-100">
                <form
                  onSubmit={handleBatchSubmit}
                  className="grid grid-cols-2 gap-4 md:grid-cols-5"
                >
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-xs font-bold text-emerald-900">
                      หมายเลขล็อต (Batch No.) *
                    </label>
                    <input
                      type="text"
                      name="batch_number"
                      required
                      value={batchData.batch_number}
                      onChange={handleBatchChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-emerald-900">
                      จำนวน *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      value={batchData.quantity}
                      onChange={handleBatchChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-emerald-900">
                      ราคา *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cost_price"
                      required
                      value={batchData.cost_price}
                      onChange={handleBatchChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-emerald-900">
                      วันหมดอายุ *
                    </label>
                    <input
                      type="date"
                      name="expiry_date"
                      required
                      value={batchData.expiry_date}
                      onChange={handleBatchChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end col-span-2 mt-2 md:col-span-5">
                    <button
                      type="button"
                      onClick={() => setShowBatchForm(false)}
                      className="cursor-pointer px-4 py-2 mr-2 text-xs font-medium transition-colors text-slate-500 hover:text-slate-700"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    >
                      บันทึกล็อตยา
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              {batches.length === 0 ? (
                <p className="p-8 text-center text-slate-500 bg-slate-50/50">
                  ไม่พบข้อมูลล็อตยาในระบบ
                </p>
              ) : (
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="border-b bg-slate-50 text-slate-700 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        หมายเลขล็อต (Batch No.)
                      </th>
                      <th className="px-6 py-4 font-semibold">วันที่รับเข้า</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        ราคา
                      </th>
                      <th className="px-6 py-4 font-semibold text-center">
                        คงเหลือ
                      </th>
                      <th className="px-6 py-4 font-semibold text-center">
                        วันหมดอายุ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((b) => {
                      const expired = isExpired(b.expiry_date);

                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors ${
                            b.quantity <= 0
                              ? "bg-slate-50 opacity-60"
                              : expired
                                ? "bg-rose-50/50 hover:bg-rose-50"
                                : "hover:bg-slate-50/50"
                          }`}
                        >
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {b.batch_number}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(b.received_date).toLocaleDateString(
                              "th-TH",
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-right">
                            {b.cost_price}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                b.quantity > 0
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {b.quantity}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-center font-bold ${expired ? "text-rose-600" : "text-amber-600"}`}
                          >
                            {new Date(b.expiry_date).toLocaleDateString(
                              "th-TH",
                            )}
                            {expired && (
                              <span className="block text-xs font-normal text-rose-500 mt-1">
                                หมดอายุ
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetail;
