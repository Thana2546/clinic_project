import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  FaBookMedical,
  FaSearch,
  FaFileCsv,
  FaUpload,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { IoAlertCircle } from "react-icons/io5";

function ICD10Manage() {
  const [icdList, setIcdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State สำหรับฟอร์มอัปโหลด
  const [showImport, setShowImport] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });

  const fetchIcdData = async (query = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/ICD-10/?search=${query}`);
      // รองรับทั้งกรณี Backend มี Pagination (res.data.results) และไม่มี (res.data)
      setIcdList(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch ICD-10 data", err);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อเปิดหน้า
  useEffect(() => {
    fetchIcdData();
  }, []);

  // ค้นหาเมื่อกด Enter หรือพิมพ์เสร็จ
  const handleSearch = (e) => {
    e.preventDefault();
    fetchIcdData(searchQuery);
  };

  // ---------------- ฟังก์ชันสำหรับอัปโหลด CSV ---------------- //
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.endsWith(".csv")) {
      setUploadMessage({ type: "error", text: "กรุณาเลือกไฟล์ .csv เท่านั้น" });
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selectedFile);
    setUploadMessage({ type: "", text: "" });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMessage({ type: "error", text: "กรุณาเลือกไฟล์ก่อนกดอัปโหลด" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadMessage({ type: "", text: "" });

    try {
      const res = await api.post("/ICD-10/import/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage({ type: "success", text: res.data.message });
      setFile(null);
      document.getElementById("icd-upload-input").value = "";
      // รีเฟรชตารางข้อมูลใหม่หลังอัปโหลดเสร็จ
      fetchIcdData();
    } catch (err) {
      const errorText =
        err.response?.data?.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์";
      setUploadMessage({ type: "error", text: errorText });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div className="flex items-center">
          <div className="p-4 mr-4 text-blue-600 bg-blue-100 rounded-full">
            <FaBookMedical className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              ฐานข้อมูลรหัสโรค (ICD-10)
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              จัดการรายการรหัสมาตรฐานและนำเข้าข้อมูลผ่านไฟล์ CSV
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowImport(!showImport)}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white transition-colors bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700"
        >
          {showImport ? (
            <>
              <FaTimes className="mr-2" /> ปิดหน้าต่างนำเข้า
            </>
          ) : (
            <>
              <FaFileCsv className="mr-2 size-4" /> นำเข้าข้อมูล (Import)
            </>
          )}
        </button>
      </div>

      {/* Import CSV Section (แสดงเมื่อกดปุ่มนำเข้าข้อมูล) */}
      {showImport && (
        <div className="p-6 bg-white border shadow-sm rounded-2xl border-blue-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              อัปโหลดไฟล์ CSV รหัสโรค
            </h2>
          </div>

          {uploadMessage.text && (
            <div
              className={`flex items-center p-4 mb-5 border rounded-xl shadow-sm text-sm font-bold ${
                uploadMessage.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {uploadMessage.type === "error" ? (
                <IoAlertCircle className="mr-2 size-5 shrink-0" />
              ) : (
                <FaCheckCircle className="mr-2 size-5 shrink-0" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="relative p-8 text-center transition-colors border-2 border-dashed cursor-pointer border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100">
              <input
                type="file"
                id="icd-upload-input"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <FaUpload className="mx-auto mb-3 text-slate-400 size-8" />
              {file ? (
                <p className="font-bold text-blue-600">{file.name}</p>
              ) : (
                <>
                  <p className="mb-1 font-bold text-slate-700">
                    คลิกหรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    ต้องมีคอลัมน์ <span className="text-blue-600">code</span>{" "}
                    และ <span className="text-blue-600">description_th</span>{" "}
                    (รองรับไฟล์ UTF-8)
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="submit"
                disabled={!file || uploading}
                className={`flex items-center px-6 py-2.5 text-sm font-bold text-white transition-colors rounded-xl shadow-sm ${
                  !file || uploading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {uploading ? "กำลังนำเข้าข้อมูล..." : "เริ่มการนำเข้าข้อมูล"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
        <div className="flex flex-col items-center justify-between p-5 border-b gap-4 md:flex-row bg-slate-50 border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            รายการรหัสโรคทั้งหมด
          </h2>

          <form onSubmit={handleSearch} className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหารหัส หรือชื่อโรค..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border bg-white rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <FaSearch className="absolute text-slate-400 left-3.5 top-2.5 size-4" />
              <button type="submit" className="hidden">
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-white text-slate-600 border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold w-32">รหัส (Code)</th>
                <th className="px-6 py-4 font-semibold">
                  ชื่อโรค / รายละเอียดการวินิจฉัย (Description)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="2"
                    className="py-10 font-medium text-center text-blue-600 animate-pulse"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : icdList.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="py-10 text-center bg-slate-50/50 text-slate-500"
                  >
                    ไม่พบข้อมูลโรคที่ค้นหา
                  </td>
                </tr>
              ) : (
                icdList.map((icd) => (
                  <tr
                    key={icd.code}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4 font-bold text-blue-700 whitespace-nowrap">
                      {icd.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {icd.description_th || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Note แสดงจำนวนที่ค้นพบกรณีไม่ได้ทำ Pagination เต็มรูปแบบ */}
        {!loading && icdList.length > 0 && (
          <div className="p-4 text-xs font-medium text-right border-t text-slate-500 border-slate-100 bg-slate-50">
            แสดงผลการค้นหา {icdList.length} รายการ
            (ใช้ช่องค้นหาเพื่อดูข้อมูลที่เจาะจง)
          </div>
        )}
      </div>
    </div>
  );
}

export default ICD10Manage;