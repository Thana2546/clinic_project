import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FaPlus } from "react-icons/fa6";
import { IoAlertCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";

// นำเข้า Sub-components
import AppointmentList from "../../components/nurse/AppointmentList";
import PatientList from "../../components/nurse/PatientList";
import PatientForm from "../../components/nurse/PatientForm";

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // States สำหรับ Form และ Edit Mode
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = สร้างใหม่, มีค่า = แก้ไขข้อมูลเดิม

  const initialFormState = {
    id_card: "",
    title: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    sex: "",
    phone: "",
    blood_group: "",
    address: "",
    district: "",
    province: "",
    zipcode: "",
    chronic: "",
    allergic: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    searchPatients("");
    fetchTodayAppointments();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchTodayAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await api.get("/follow-ups/");
      // ใช้โค้ดแก้ไข Timezone ที่แม่นยำกว่า เพื่อหาคิวนัดของวันนี้ตามเวลา Local
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localToday = new Date(today.getTime() - offset * 60 * 1000);
      const todayStr = localToday.toISOString().split("T")[0];

      const todaysApps = res.data.filter(
        (app) => app.follow_up_date === todayStr && app.status === "scheduled",
      );
      setAppointments(todaysApps);
    } catch (err) {
      console.error("โหลดข้อมูลการนัดหมายไม่สำเร็จ", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const searchPatients = async (query) => {
    setLoading(true);
    try {
      const res = await api.get(`/patients/?search=${query}`);
      setPatients(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "ไม่สามารถค้นหาข้อมูลผู้ป่วยได้" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchPatients(searchQuery);
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ฟังก์ชันสำหรับเปิดฟอร์มแก้ไข
  const handleEditClick = (patient) => {
    setFormData(patient); // นำข้อมูลเก่าเทใส่ฟอร์ม
    setEditingId(patient.id); // บันทึกว่ากำลังแก้ ID อะไร
    setShowForm(true); // เปิดหน้าฟอร์ม
  };

  // ฟังก์ชันที่ครอบคลุมทั้ง สร้างใหม่ (POST) และ แก้ไข (PATCH)
  const handleSavePatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Mode: แก้ไข
        await api.patch(`/patients/${editingId}/`, formData);
        setMessage({ type: "success", text: "อัปเดตข้อมูลผู้ป่วยสำเร็จ!" });
      } else {
        // Mode: สร้างใหม่
        await api.post("/patients/", formData);
        setMessage({ type: "success", text: "ลงทะเบียนผู้ป่วยใหม่สำเร็จ!" });
      }

      setShowForm(false);
      setEditingId(null);
      searchPatients(searchQuery);
      setFormData(initialFormState);
    } catch (err) {
      setMessage({
        type: "error",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบข้อมูลอีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWalkInQueue = async (patientId) => {
    try {
      await api.post("/daily-queues/", {
        patient: patientId,
        queue_type: "walk_in",
        priority: 0,
      });
      setMessage({ type: "success", text: "ส่งผู้ป่วยเข้าคิวสำเร็จ!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: "ไม่สามารถส่งเข้าคิวได้ (อาจอยู่ในคิวแล้ว)",
      });
    }
  };

  const handleCheckIn = async (appointmentId, patientName) => {
    try {
      const res = await api.post(`/follow-ups/${appointmentId}/check_in/`);
      setMessage({
        type: "success",
        text: `เช็คอินผู้ป่วย ${patientName} สำเร็จ! (หมายเลขคิว: ${res.data.queue_number})`,
      });
      fetchTodayAppointments();
    } catch (err) {
      setMessage({ type: "error", text: "ไม่สามารถเช็คอินการนัดหมายได้" });
    }
  };

  // ปุ่มเปิดฟอร์มสร้างผู้ป่วยใหม่
  const toggleNewPatientForm = () => {
    if (showForm) {
      setShowForm(false);
      setEditingId(null);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
      setShowForm(true);
    }
  };

  return (
    <div className="font-sans space-y-6 text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-blue-900">
            การจัดการข้อมูลผู้ป่วย
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบจัดการฐานข้อมูลผู้ป่วยและการรับคิว
          </p>
        </div>
        <button
          onClick={toggleNewPatientForm}
          className={`cursor-pointer flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-colors rounded-xl shadow-sm ${
            showForm
              ? "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showForm ? (
            "กลับสู่หน้ารายชื่อ"
          ) : (
            <>
              <FaPlus className="mr-2 size-4" /> สร้างประวัติผู้ป่วยใหม่
            </>
          )}
        </button>
      </div>

      {/* แจ้งเตือน Alert */}
      {message.text && (
        <div
          className={`flex items-center p-4 border rounded-xl shadow-sm ${message.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
        >
          {message.type === "error" ? (
            <IoAlertCircle className="mr-2 size-5" />
          ) : (
            <FaCheckCircle className="mr-2 size-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {!showForm ? (
        <div className="space-y-6">
          <AppointmentList
            appointments={appointments}
            loadingAppointments={loadingAppointments}
            handleCheckIn={handleCheckIn}
          />
          <PatientList
            patients={patients}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
            handleAddWalkInQueue={handleAddWalkInQueue}
            handleEditClick={handleEditClick}
          />
        </div>
      ) : (
        <PatientForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSavePatient={handleSavePatient}
          setShowForm={setShowForm}
          loading={loading}
          isEditing={!!editingId}
        />
      )}
    </div>
  );
}

export default PatientManagement;