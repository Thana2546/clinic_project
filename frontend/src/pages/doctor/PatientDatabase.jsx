import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FaUserInjured, FaSearch, FaHistory } from "react-icons/fa";
import { TbDatabaseSearch } from "react-icons/tb";
import HistoryModal from "../../components/Doctor/HistoryModal";

function PatientDatabase() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State สำหรับ History Modal
  const [showHistory, setShowHistory] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [activePatientMock, setActivePatientMock] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/patients/");
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  // ดึงประวัติการรักษาเมื่อกดปุ่ม "ดูประวัติ"
  const handleViewHistory = async (patient) => {
    try {
      const res = await api.get("/medical-records/");
      // กรองเฉพาะประวัติของคนไข้รายนี้ และเรียงจากใหม่ไปเก่า
      const history = res.data
        .filter((r) => r.patient === patient.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setPatientHistory(history);

      // จำลอง Object activeQueue เพื่อส่งให้ HistoryModal แสดงชื่อและ HN ได้ถูกต้อง
      setActivePatientMock({
        patient_name:
          `${patient.title || ""} ${patient.first_name} ${patient.last_name}`.trim(),
        hn_number: patient.hn_number,
      });

      setShowHistory(true);
    } catch (err) {
      console.error("Failed to fetch medical history", err);
      alert("ไม่สามารถดึงประวัติการรักษาได้");
    }
  };

  // กรองผู้ป่วยตามคำค้นหา (ค้นได้ทั้งชื่อและ HN)
  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      (p.hn_number && p.hn_number.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query))
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div className="flex items-center">
          <div className="p-4 mr-4 text-blue-600 bg-blue-100 rounded-full shrink-0">
            <TbDatabaseSearch className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              ฐานข้อมูลผู้ป่วย (Patient Database)
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              ค้นหารายชื่อผู้ป่วยทั้งหมดในระบบและเรียกดูประวัติการรักษา
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
          <h2 className="font-bold text-slate-800 text-lg flex items-center">
            <FaUserInjured className="mr-2 text-blue-600" />{" "}
            รายชื่อผู้ป่วยทั้งหมด
          </h2>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="ค้นหาชื่อ, นามสกุล, รหัส HN หรือเบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm shadow-sm transition-all"
            />
            <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 size-4" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700">
                  รหัส (HN)
                </th>
                <th className="px-6 py-4 font-bold text-slate-700">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 font-bold text-slate-700">
                  เบอร์โทรศัพท์
                </th>
                <th className="px-6 py-4 font-bold text-slate-700">อายุ/เพศ</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-right">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-12 text-center text-blue-600 animate-pulse font-medium bg-slate-50/50"
                  >
                    กำลังโหลดข้อมูลผู้ป่วย...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-12 text-center text-slate-500 bg-slate-50/50"
                  >
                    ไม่พบข้อมูลผู้ป่วยที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-blue-700">
                      {patient.hn_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {patient.title} {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {patient.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {patient.sex || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewHistory(patient)}
                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                      >
                        <FaHistory className="mr-2" /> ดูประวัติการรักษา
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredPatients.length > 0 && (
          <div className="p-4 text-xs font-medium text-right border-t text-slate-500 border-slate-100 bg-slate-50">
            แสดงผลการค้นหา {filteredPatients.length} รายการ
          </div>
        )}
      </div>

      {/* History Modal Component */}
      <HistoryModal
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        patientHistory={patientHistory}
        activeQueue={activePatientMock}
      />
    </div>
  );
}

export default PatientDatabase;
