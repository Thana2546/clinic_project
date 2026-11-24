import React from "react";
import { Link } from "react-router-dom";
import { FaUserDoctor } from "react-icons/fa6";
import { FaUserNurse } from "react-icons/fa6";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaHospital } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

function SelectRolePage() {
  const roles = [
    {
      id: "doctor",
      label: "Doctor Login",
      desc: "สำหรับแพทย์",
      icon: <FaUserDoctor />,
      color:
        "bg-blue-300 text-blue-700 hover:border-blue-500 hover:shadow-blue-100",
      borderColor: "border-blue-200",
      link: "doctor/login/",
    },
    {
      id: "nurse",
      label: "Nurse Login",
      desc: "สำหรับพยาบาล",
      icon: <FaUserNurse />,
      color:
        "bg-pink-300 text-pink-700 hover:border-pink-500 hover:shadow-pink-100",
      borderColor: "border-pink-200",
      link: "nurse/login/",
    },
    {
      id: "admin",
      label: "Admin Login",
      desc: "สำหรับผู้ดูแลระบบ",
      icon: <MdAdminPanelSettings />,
      color:
        "bg-black text-gray-500 hover:border-gray-300 hover:shadow-gray-100",
      borderColor: "border-gray-200",
      link: "admin/login/",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-blue-600 items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/90 to-purple-700/90 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Hospital"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-white text-center p-10 max-w-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl text-4xl border border-white/30">
              <FaHospital className="w-20 h-20" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">ระบบจัดการคลินิก</h1>
          <p className="text-blue-100 text-lg">
            ระบบบริหารจัดการคลินิก สำหรับแพทย์ พยาบาล และบุคลากรทางการแพทย์
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="lg:hidden mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-600">ระบบจัดการคลินิก</h2>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-gray-500">
              กรุณาเลือกประเภทผู้ใช้งานเพื่อเข้าสู่ระบบ
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-8">
            {roles.map((role) => (
              <Link
                key={role.id}
                to={role.link}
                className={`relative group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-in-out
                hover:-translate-y-1 hover:shadow-lg overflow-hidden
                ${role.color} ${role.borderColor}
                `}
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                  {role.icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold">{role.label}</h3>
                  <p className="text-sm opacity-80">{role.desc}</p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 translate-opacity transform -translate-x-2.5 group-hover:translate-x-0">
                  <IoIosArrowForward className="size-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectRolePage;
