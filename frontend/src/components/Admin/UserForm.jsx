const UserForm = ({ formData, handleChange, handleSubmit, toggleForm }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-50">
      <div className="mb-6 border-b border-blue-50 pb-4">
        <h2 className="text-xl font-bold text-blue-900">
          ลงทะเบียนพนักงานใหม่
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          สร้างบัญชีผู้ใช้งานระบบสำหรับแพทย์ พยาบาล หรือผู้ดูแลระบบ
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5"
      >
        {/* System Info */}
        <div className="md:col-span-3 font-bold text-blue-900 mt-2 text-[16px]">
          1. ข้อมูลสำหรับเข้าสู่ระบบ
        </div>
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
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
          <label className="block mb-1.5 text-sm text-slate-700">
            รหัสผ่าน (Password) *
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
            ตำแหน่ง (Role) *
          </label>
          <select
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="" disabled>
              -- เลือกบทบาท --
            </option>
            <option value="nurse">พยาบาล</option>
            <option value="doctor">แพทย์</option>
            <option value="admin">ผู้ดูแลระบบ</option>
          </select>
        </div>

        {/* Personal Info */}
        <div className="md:col-span-3 font-bold text-blue-900 mt-2 text-[16px] border-gray-300">
          2. ข้อมูลส่วนตัว
        </div>

        {/* เพิ่ม Dropdown คำนำหน้าชื่อ */}
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
            คำนำหน้าชื่อ *
          </label>
          <select
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="" disabled>
              -- เลือกคำนำหน้า --
            </option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
            <option value="นพ.">นพ.</option>
            <option value="พญ.">พญ.</option>
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
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
          <label className="block mb-1.5 text-sm text-slate-700">
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
          <label className="block mb-1.5 text-sm text-slate-700">เพศ *</label>
          <select
            name="sex"
            required
            value={formData.sex}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="" disabled>
              -- เลือกเพศ --
            </option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-sm text-slate-700">อีเมล *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
            เบอร์โทรศัพท์
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-3 font-bold text-blue-900 mt-2 text-[16px] border-gray-300">
          3. ข้อมูลที่อยู่
        </div>

        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div className="md:col-span-3">
            <label className="block mb-1.5 text-sm text-slate-700">
              ที่อยู่ / บ้านเลขที่
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1.5 text-sm text-slate-700">หมู่</label>
            <input
              type="text"
              name="moo"
              value={formData.moo}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
            ตำบล/แขวง
          </label>
          <input
            type="text"
            name="sub_district"
            value={formData.sub_district}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
            อำเภอ/เขต
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">จังหวัด</label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm text-slate-700">
            รหัสไปรษณีย์
          </label>
          <input
            type="text"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        {/* Professional Info (เฉพาะหมอ/พยาบาล) */}
        {formData.role !== "admin" && (
          <>
            <div className="md:col-span-3 font-bold text-blue-900 mt-2 text-[16px]">
              4. ข้อมูลวิชาชีพ
            </div>
            <div className="md:col-span-1">
              <label className="block mb-1.5 text-sm text-slate-700">
                เลขใบประกอบวิชาชีพ *
              </label>
              <input
                type="text"
                name="license_number"
                required
                value={formData.license_number}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="md:col-span-3 pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={toggleForm}
            className="cursor-pointer px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="cursor-pointer px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
          >
            บันทึกข้อมูลพนักงาน
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
