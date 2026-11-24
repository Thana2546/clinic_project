import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    title: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    role: "",
    sex: "ชาย",
    address: "",
    moo: "",
    sub_district: "",
    district: "",
    province: "",
    zipcode: "",
    phone: "",
    license_number: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get(`/users/${id}/`);
        setFormData({
          ...userRes.data,
          password: "",
          license_number: userRes.data.license_number || "",
        });
      } catch (err) {
        alert("ไม่พบข้อมูลผู้ใช้งาน หรือเกิดข้อผิดพลาดในการโหลดข้อมูล");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      await api.patch(`/users/${id}/`, payload);
      alert("อัปเดตข้อมูลพนักงานสำเร็จ!");
      navigate("/admin/users");
    } catch (err) {
      alert("ไม่สามารถอัปเดตข้อมูลได้ กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="font-medium text-blue-600 animate-pulse">
          กำลังโหลดรายละเอียดผู้ใช้งาน...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex items-center p-6 space-x-4 bg-white border shadow-sm rounded-2xl border-blue-50">
        <button
          onClick={() => navigate("/admin/users")}
          className="p-2 transition-colors bg-white border rounded-lg shadow-sm text-slate-500 border-slate-200 hover:bg-slate-50"
        >
          <FaArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="flex items-center text-2xl font-bold text-blue-900">
            <FaUser className="mr-3 text-blue-600 size-5" /> แก้ไขข้อมูลพนักงาน
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ปรับปรุงข้อมูลส่วนตัว สิทธิ์การใช้งาน และข้อมูลวิชาชีพ
          </p>
        </div>
      </div>

      <div className="p-6 bg-white border shadow-sm md:p-8 rounded-2xl border-blue-50">
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5"
        >
          {/* Active Status Checkbox */}
          <div className="md:col-span-3">
            <label className="flex items-center p-4 space-x-3 font-bold transition-colors cursor-pointer text-blue-900 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>
                เปิดใช้งานบัญชีนี้
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ( เอาเครื่องหมายออกเพื่อระงับการใช้งาน )
                </span>
              </span>
            </label>
          </div>

          {/* System Information */}
          <div className="pb-2 mt-2 text-sm font-bold tracking-wide uppercase border-b border-blue-100 md:col-span-3 text-blue-800">
            1. ข้อมูลสำหรับเข้าสู่ระบบ
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              ชื่อผู้ใช้งาน (Username) *
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              ตั้งรหัสผ่านใหม่ (New Password)
            </label>
            <input
              type="password"
              name="password"
              placeholder="(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              ตำแหน่ง
            </label>
            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full px-3 py-2 text-sm font-medium capitalize border cursor-not-allowed rounded-xl bg-slate-100 border-slate-200 text-slate-500"
            />
          </div>

          {/* Personal Information */}
          <div className="pb-2 mt-4 text-sm font-bold tracking-wide uppercase border-b border-blue-100 md:col-span-3 text-blue-800">
            2. ข้อมูลส่วนตัว
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              คำนำหน้าชื่อ *
            </label>
            <select
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
              <option value="นพ.">นพ.</option>
              <option value="พญ.">พญ.</option>
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              ชื่อจริง *
            </label>
            <input
              type="text"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              นามสกุล *
            </label>
            <input
              type="text"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              เพศ *
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              อีเมล
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div className="pb-2 mt-4 text-sm font-bold tracking-wide uppercase border-b border-blue-100 md:col-span-3 text-blue-800">
            3. ข้อมูลที่อยู่
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              ที่อยู่ / บ้านเลขที่
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              หมู่ที่
            </label>
            <input
              type="text"
              name="moo"
              value={formData.moo || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              ตำบล/แขวง
            </label>
            <input
              type="text"
              name="sub_district"
              value={formData.sub_district || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              อำเภอ/เขต
            </label>
            <input
              type="text"
              name="district"
              value={formData.district || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              จังหวัด
            </label>
            <input
              type="text"
              name="province"
              value={formData.province || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700">
              รหัสไปรษณีย์
            </label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Professional Information */}
          {formData.role !== "admin" && (
            <>
              <div className="pb-2 mt-4 text-sm font-bold tracking-wide uppercase border-b border-blue-100 md:col-span-3 text-blue-800">
                4. ข้อมูลวิชาชีพ
              </div>
              <div className="md:col-span-1">
                <label className="block mb-1.5 text-sm font-bold text-slate-700">
                  เลขใบประกอบวิชาชีพ
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-6 mt-6 border-t border-slate-100 md:col-span-3">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-6 py-2.5 mr-3 text-sm font-medium transition-colors bg-white border rounded-xl text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-8 py-2.5 rounded-xl shadow-sm font-bold flex items-center transition-colors ${
                isSaving
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaSave className="mr-2 size-5" />{" "}
              {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserDetail;
