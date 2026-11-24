import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { GiHospitalCross } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  FaUserInjured,
  FaAward,
  FaPills,
  FaStethoscope,
  FaRegCalendarDays,
  FaUserClock,
  FaBookMedical,
  FaReceipt,
} from "react-icons/fa6";
import { FaUserCog } from "react-icons/fa";
import { TbDatabaseSearch } from "react-icons/tb";

function SideBar({ isOpen, setIsOpen }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const MENU_CONFIG = {
    admin: [
      {
        title: "Dashboard",
        path: "/admin",
        icon: <LuLayoutDashboard className="size-5" />,
      },
      {
        title: "จัดการผู้ใช้งาน",
        path: "/admin/users",
        icon: <FaUserCog className="size-5" />,
      },
      {
        title: "จัดการคลังยา",
        path: "/admin/medicines",
        icon: <FaPills className="size-5" />,
      },
      {
        title: "ICD10",
        path: "/admin/ICD10",
        icon: <FaBookMedical className="size-5" />,
      },
    ],
    nurse: [
      {
        title: "Dashboard",
        path: "/nurse",
        icon: <LuLayoutDashboard className="size-5" />,
      },
      {
        title: "จัดการผู้ป่วย",
        path: "/nurse/patients",
        icon: <FaUserInjured className="size-5" />,
      },
      {
        title: "จัดการคิว",
        path: "/nurse/queue",
        icon: <FaUserClock className="size-5" />,
      },
      {
        title: "จ่ายยา",
        path: "/nurse/pharmacy",
        icon: <FaPills className="size-5" />,
      },
      {
        title: "ชำระเงิน",
        path: "/nurse/billing",
        icon: <FaReceipt className="size-5" />,
      },
    ],
    doctor: [
      {
        title: "Dashboard",
        path: "/doctor",
        icon: <LuLayoutDashboard className="size-5" />,
      },
      {
        title: "ปฏิทิน",
        path: "/doctor/appointments",
        icon: <FaRegCalendarDays className="size-5" />,
      },
      {
        title: "ห้องตรวจ",
        path: "/doctor/queue",
        icon: <FaStethoscope className="size-5" />,
      },
      {
        title: "คนไข้และประวัติ",
        path: "/doctor/patient-history",
        icon: <TbDatabaseSearch className="size-5" />,
      },
    ],
  };

  const menuItems = user ? MENU_CONFIG[user.role] : [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* พื้นที่ใส่ Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GiHospitalCross className="size-5 text-blue-800" />
          <span className="text-lg font-bold text-blue-800">
            ระบบจัดการคลินิก
          </span>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 hover:text-slate-600"
        >
          <IoClose className="size-5" />
        </button>
      </div>

      {/* เส้นทางไปหน้าต่างๆ */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <span
                className={`mr-3 ${isActive ? "text-primary-600" : "text-gray-400"}`}
              >
                {item.icon}
              </span>
              <p className="text-md">{item.title}</p>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default SideBar;
