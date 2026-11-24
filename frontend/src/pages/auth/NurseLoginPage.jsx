import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CiUser } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";

function NurseLoginPage() {
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
      if (userData.role === "nurse") navigate("/nurse");
      if (userData.role !== "nurse") setError("บทบาทผู้ใช้งานไม่ถูกต้อง")
    } catch (err) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="lg:hidden mb-8 text-center">
          <h2 className="text-3xl font-bold text-pink-600">ระบบจัดการคลินิก</h2>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back! Nurse
            </h2>
            <p className="mt-2 text-gray-500">เข้าสู่ระบบสำหรับพยาบาล</p>
          </div>

          {error && <p className="text-xs text-red-600 mb-1">* {error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <CiUser className="size-5 stroke-1" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Username"
                  value={formData.username}
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <CiLock className="size-5 stroke-1" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={isShowPass ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  onClick={() => setIsShowPass(!isShowPass)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg shadow-md transition-all hover:shadow-lg transform active:scale-[0.98]"
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NurseLoginPage;
