import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  FaUserAlt,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaStethoscope,
  FaUserNurse,
  FaUserShield,
  FaRegCalendarAlt,
} from "react-icons/fa";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile/");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center text-slate-500 font-medium">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          กำลังโหลดข้อมูลระบบ...
        </div>
      </div>
    );
  }

  if (!profile)
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-100 rounded-md mt-6 font-medium">
        เกิดข้อผิดพลาด ไม่สามารถดึงข้อมูลบุคลากรได้
      </div>
    );

  const roleConfig = {
    doctor: {
      icon: <FaStethoscope size={32} className="text-slate-400" />,
      title: "แพทย์ (Doctor)",
    },
    nurse: {
      icon: <FaUserNurse size={32} className="text-slate-400" />,
      title: "พยาบาล (Nurse)",
    },
    admin: {
      icon: <FaUserShield size={32} className="text-slate-400" />,
      title: "ผู้ดูแลระบบ (Administrator)",
    },
  };
  const config = roleConfig[profile.role] || roleConfig.nurse;

  const formatAddress = () => {
    if (!profile.address && !profile.province) return "ไม่ระบุ";
    const parts = [];
    if (profile.address) parts.push(profile.address);
    if (profile.moo) parts.push(`หมู่ที่ ${profile.moo}`);
    if (profile.sub_district) parts.push(`ต.${profile.sub_district}`);
    if (profile.district) parts.push(`อ.${profile.district}`);
    if (profile.province) parts.push(`จ.${profile.province}`);
    if (profile.zipcode) parts.push(profile.zipcode);
    return parts.join(" ");
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">ข้อมูลส่วนตัว</h1>
        <p className="text-sm text-slate-500 mt-1">
          ระบบสารสนเทศข้อมูลส่วนบุคคลและข้อมูลวิชาชีพ
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Top Section: Identity */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 bg-slate-50/50 border-b border-slate-200">
          <div className="h-24 w-24 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center shrink-0">
            {config.icon}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-slate-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <div className="text-slate-500 text-sm mt-1 font-medium">
              รหัสผู้ใช้งาน: {profile.username}
            </div>
            <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-white border border-slate-300 text-slate-700 shadow-sm">
              <FaIdCard className="mr-2 text-slate-400" />
              {config.title}
            </div>
          </div>
        </div>

        {/* Bottom Section: Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Column 1: Personal Info */}
          <div className="p-6 md:p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center">
              <FaUserAlt className="mr-2" /> ข้อมูลส่วนบุคคล
            </h3>
            <dl className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-semibold text-slate-500">เพศ</dt>
                <dd className="text-sm text-slate-900 col-span-2">
                  {profile.sex || "ไม่ระบุ"}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-semibold text-slate-500">อีเมล</dt>
                <dd className="text-sm text-slate-900 col-span-2">
                  {profile.email || "ไม่ระบุ"}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-semibold text-slate-500 flex items-center">
                  หมายเลขโทรศัพท์
                </dt>
                <dd className="text-sm text-slate-900 col-span-2">
                  {profile.phone || "ไม่ระบุ"}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <dt className="text-sm font-semibold text-slate-500 flex items-start mt-0.5">
                  ที่อยู่ติดต่อ
                </dt>
                <dd className="text-sm text-slate-900 col-span-2 leading-relaxed">
                  {formatAddress()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Column 2: Professional Info */}
          <div className="p-6 md:p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center">
              <FaIdCard className="mr-2" /> ข้อมูลวิชาชีพ
            </h3>
            <dl className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-semibold text-slate-500 flex items-center">
                  สถานะการทำงาน
                </dt>
                <dd className="text-sm col-span-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    ปฏิบัติงานปกติ (Active)
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-semibold text-slate-500">
                  วันที่เริ่มงาน
                </dt>
                <dd className="text-sm text-slate-900 col-span-2">
                  {new Date(profile.date_joined).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>

              {profile.role !== "admin" && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <dt className="text-sm font-semibold text-slate-500 mt-1">
                    เลขใบประกอบวิชาชีพ
                  </dt>
                  <dd className="text-sm text-slate-900 col-span-2">
                    {profile.license_number ? (
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {profile.license_number}
                      </span>
                    ) : (
                      "ไม่ระบุ"
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;