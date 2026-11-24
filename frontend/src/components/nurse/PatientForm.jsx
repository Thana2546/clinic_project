import { FaUserPlus, FaUserEdit } from "react-icons/fa";

const PatientForm = ({
  formData,
  handleInputChange,
  handleSavePatient,
  setShowForm,
  loading,
  isEditing,
}) => {
  return (
    <div className="p-6 bg-white border shadow-sm md:p-8 rounded-2xl border-blue-50">
      <div className="flex items-center pb-4 mb-6 border-b border-blue-50">
        {isEditing ? (
          <FaUserEdit className="mr-3 text-amber-500 size-5" />
        ) : (
          <FaUserPlus className="mr-3 text-blue-600 size-5" />
        )}
        <h2 className="text-xl font-bold text-blue-900">
          {isEditing
            ? "แก้ไขประวัติผู้ป่วย (Edit Patient)"
            : "ลงทะเบียนผู้ป่วยใหม่ (Register New Patient)"}
        </h2>
      </div>

      <form
        onSubmit={handleSavePatient}
        className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5"
      >
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            เลขประจำตัวประชาชน 13 หลัก *
          </label>
          <input
            type="text"
            name="id_card"
            required
            maxLength="13"
            value={formData.id_card}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isEditing}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            คำนำหน้า *
          </label>
          <select
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- ระบุคำนำหน้า --</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
            <option value="เด็กชาย">เด็กชาย</option>
            <option value="เด็กหญิง">เด็กหญิง</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            เบอร์โทรศัพท์
          </label>
          <input
            type="text"
            name="phone"
            maxLength="10"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm text-slate-700">
            ชื่อ *
          </label>
          <input
            type="text"
            name="first_name"
            required
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm text-slate-700">
            นามสกุล *
          </label>
          <input
            type="text"
            name="last_name"
            required
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            วัน/เดือน/ปี เกิด *
          </label>
          <input
            type="date"
            name="date_of_birth"
            required
            value={formData.date_of_birth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            เพศ *
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- ระบุเพศ --</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            กรุ๊ปเลือด
          </label>
          <select
            name="blood_group"
            value={formData.blood_group}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- ระบุหมู่เลือด --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="O">O</option>
            <option value="AB">AB</option>
            <option value="Unknown">ไม่ทราบ</option>
          </select>
        </div>

        {/* ข้อมูลที่อยู่ และ โรคประจำตัว (อิงจาก State ในไฟล์เก่าของคุณ) */}
        <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
          <h3 className="font-bold text-slate-700 mb-4 text-sm">
            ข้อมูลเพิ่มเติม
          </h3>
        </div>
        <div className="md:col-span-3">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            ที่อยู่
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            อำเภอ/เขต
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            จังหวัด
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            รหัสไปรษณีย์
          </label>
          <input
            type="text"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-medium text-rose-600">
            ประวัติแพ้ยา
          </label>
          <input
            type="text"
            name="allergic"
            placeholder="เช่น Amoxicillin, ไม่มี"
            value={formData.allergic}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-rose-50 border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">
            โรคประจำตัว
          </label>
          <input
            type="text"
            name="chronic"
            value={formData.chronic}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end pt-6 mt-4 space-x-3 border-t border-slate-100 md:col-span-3">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="cursor-pointer px-6 py-2.5 text-sm font-medium transition-colors bg-white border rounded-xl text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer px-6 py-2.5 text-sm font-bold text-white transition-colors rounded-xl shadow-sm ${isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading
              ? "กำลังบันทึก..."
              : isEditing
                ? "บันทึกการแก้ไข"
                : "บันทึกประวัติผู้ป่วย"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
