import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { FaShieldAlt } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { BiLock } from "react-icons/bi";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";

function AdminLoginPage() {
  const [isShowPass, setIsShowPass] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userData = await login(formData);
      if (userData.role === "admin") navigate("/admin");
      if (userData.role !== "admin") setError("บทบาทผู้ใช้งานไม่ถูกต้อง")
    } catch (err) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-indigo-900 items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900/90 to-slate-900/90 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Hospital"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 text-white text-center p-10 max-w-xl">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-5xl border border-white/20 shadow-2xl">
              <FaShieldAlt />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">ผู้ดูแลระบบ</h1>
          <p className="text-indigo-100 text-lg">
            ระบบหลังบ้านสำหรับผู้ดูแลระบบ เพื่อจัดการข้อมูลแพทย์ พยาบาล
            และผู้ป่วย
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="text-4xl mb-2">
            <FaShieldAlt />
          </div>
          <h2 className="text-2xl font-bold text-indigo-900">ผู้ดูแลระบบ</h2>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Administrator
            </h2>
            <p className="mt-2 text-gray-500">
              กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <span className="text-2xl">
                <FaLock />
              </span>
              <h3 className="text-xl font-bold text-gray-800">เข้าสู่ระบบ</h3>
            </div>

            {error && <p className="text-xs text-red-600 mb-1">* {error}</p>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-400"
                >
                  Username
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <RiAdminLine className="size-5" />
                    </span>
                    <input
                      id="username"
                      name="username"
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                      placeholder="Username"
                      value={formData.username}
                      onChange={onChange}
                    />
                  </div>
                </label>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <BiLock className="size-5" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    required
                    type={isShowPass ? "text" : "password"}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setIsShowPass(!isShowPass)}
                  >
                    {isShowPass ? (
                      <IoEyeOffOutline className="size-5 stroke-1" />
                    ) : (
                      <IoEyeOutline className="size-5 stroke-1" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-bold text-white shadow-md transition-all hover:bg-indigo-700 bg-indigo-600 hover:shadow-lg transform active:scale-[0.98]"
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-2">
              © 2026 ระบบจัดการคลินิก
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
