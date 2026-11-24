import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FaUser, FaUserPlus } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";

import UserForm from "../../components/Admin/UserForm";
import UserList from "../../components/Admin/UserList";

function UserManage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const initialFormState = {
    username: "",
    password: "",
    email: "",
    title: "",
    first_name: "",
    last_name: "",
    role: "",
    sex: "",
    address: "",
    moo: "",
    sub_district: "",
    district: "",
    province: "",
    zipcode: "",
    phone: "",
    license_number: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const resUsers = await api.get("/users/");
      setUsers(resUsers.data);
    } catch (err) {
      console.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/", formData);
      alert("เพิ่มข้อมูลพนักงานสำเร็จ!");
      setShowForm(false);
      setFormData(initialFormState);
      fetchData();
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.username) {
          alert(`ข้อผิดพลาด: ชื่อผู้ใช้นี้ถูกลงทะเบียนไว้แล้วในระบบ`);
        } else if (data.email) {
          alert(`ข้อผิดพลาด: ${data.email[0]}`);
        } else {
          alert("ไม่สามารถสร้างบัญชีได้ กรุณาตรวจสอบข้อมูลให้ครบถ้วน");
        }
      } else {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
      return;
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) setFormData(initialFormState);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section พร้อมปุ่มแบบเดียวกับ PatientManagement */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <FaUser className="mr-3 text-blue-600 size-6" /> จัดการข้อมูลพนักงาน
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบจัดการฐานข้อมูลพนักงาน แพทย์ และพยาบาล
          </p>
        </div>

        {/* ย้ายปุ่ม Add New Staff มาไว้ตรงนี้ */}
        <button
          onClick={toggleForm}
          className={`flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-colors rounded-xl shadow-sm cursor-pointer ${
            showForm
              ? "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showForm ? (
            <IoArrowBack />
          ) : (
            <>
              <FaUserPlus className="mr-2 size-4" /> เพิ่มพนักงานใหม่
            </>
          )}
        </button>
      </div>

      {!showForm ? (
        <UserList users={users} />
      ) : (
        <UserForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          toggleForm={toggleForm}
        />
      )}
    </div>
  );
}

export default UserManage;
