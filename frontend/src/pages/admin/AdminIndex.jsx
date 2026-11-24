import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  FaUserInjured,
  FaUserClock,
  FaDollarSign,
  FaClock,
  FaUserMd,
  FaUserNurse,
} from "react-icons/fa";
import { IoAlertCircle } from "react-icons/io5";

function AdminIndex() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/admin-dashboard/");
        setData(response.data);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-blue-600 animate-pulse font-medium">
          กำลังโหลดข้อมูล Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mx-4 mt-4 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            ภาพรวมระบบจัดการคลินิกและการแจ้งเตือนสำคัญ
          </p>
        </div>
      </div>

      {/* ข้อมูลสถิติ (Stats Grid) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: คนไข้ทั้งหมด */}
        <div className="flex items-center p-6 transition-shadow bg-white border border-blue-100 shadow-sm rounded-2xl hover:shadow-md">
          <div className="p-4 mr-4 text-blue-700 rounded-full bg-blue-50">
            <FaUserInjured className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">คนไข้ทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-800">
              {data.total_patients}
            </p>
          </div>
        </div>

        {/* Card 2: คนไข้วันนี้ */}
        <div className="flex items-center p-6 transition-shadow bg-white border border-blue-100 shadow-sm rounded-2xl hover:shadow-md">
          <div className="p-4 mr-4 text-sky-700 rounded-full bg-sky-50">
            <FaUserClock className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">คนไข้วันนี้</p>
            <p className="text-2xl font-bold text-slate-800">
              {data.today_visits}
            </p>
          </div>
        </div>

        {/* Card 3: รายได้วันนี้ */}
        <div className="flex items-center p-6 transition-shadow bg-white border border-blue-100 shadow-sm rounded-2xl hover:shadow-md">
          <div className="p-4 mr-4 text-indigo-700 rounded-full bg-indigo-50">
            <FaDollarSign className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">รายได้วันนี้</p>
            <p className="text-2xl font-bold text-slate-800">
              ฿{" "}
              {data.today_revenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Card 4: บุคลากรทั้งหมด */}
        <div className="flex flex-col justify-center p-6 transition-shadow bg-white border border-blue-100 shadow-sm rounded-2xl hover:shadow-md">
          <p className="mb-3 text-sm font-medium text-slate-500">
            บุคลากรทั้งหมด
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <FaUserMd className="text-blue-400 size-4" />
              <span className="font-semibold text-slate-700">
                {data.total_doctors}{" "}
                <span className="text-sm font-normal text-slate-500">
                  แพทย์
                </span>
              </span>
            </div>
            <div className="w-px h-6 bg-blue-100"></div>
            <div className="flex items-center gap-2">
              <FaUserNurse className="text-blue-400 size-4" />
              <span className="font-semibold text-slate-700">
                {data.total_nurses}{" "}
                <span className="text-sm font-normal text-slate-500">
                  พยาบาล
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ข้อมูลยาและการแจ้งเตือน */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ยาที่ใกล้หมดคลัง */}
        <div className="overflow-hidden bg-white border border-blue-100 shadow-sm rounded-2xl">
          <div className="flex items-center px-6 py-4 bg-white border-b border-blue-50">
            <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-rose-50">
              <IoAlertCircle className="text-rose-500 size-5" />
            </div>
            <h3 className="font-bold text-slate-800">ยาที่ใกล้หมดคลัง</h3>
          </div>
          <div className="p-6 bg-slate-50/50">
            {data.low_stock_medicines.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <p className="text-sm">
                  คลังยาอยู่ในสถานะปกติ ไม่มีรายการยาที่เหลือน้อย
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.low_stock_medicines.map((med) => (
                  <li
                    key={med.id}
                    className="flex items-center justify-between p-4 transition-colors bg-white border border-rose-100 rounded-xl hover:border-rose-200"
                  >
                    <span className="font-medium text-slate-700">
                      {med.drug_name}
                    </span>
                    <div className="px-3 py-1 text-sm font-bold rounded-full text-rose-700 bg-rose-50">
                      เหลือ {med.total_stock}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ยาใกล้หมดอายุ */}
        <div className="overflow-hidden bg-white border border-blue-100 shadow-sm rounded-2xl">
          <div className="flex items-center px-6 py-4 bg-white border-b border-blue-50">
            <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-amber-50">
              <FaClock className="text-amber-500 size-4" />
            </div>
            <h3 className="font-bold text-slate-800">
              ยาใกล้หมดอายุ (ภายใน 30 วัน)
            </h3>
          </div>
          <div className="p-6 bg-slate-50/50">
            {data.expiring_medicines.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <p className="text-sm">ไม่มียาที่ใกล้หมดอายุในเร็วๆ นี้</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.expiring_medicines.map((batch, index) => (
                  <li
                    key={index}
                    className="flex flex-col p-4 transition-colors bg-white border border-amber-100 rounded-xl hover:border-amber-200"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-slate-700">
                        {batch.medicine_name}
                      </span>
                      <span className="px-3 py-1 text-sm font-bold rounded-full text-amber-700 bg-amber-50">
                        {batch.expiry_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        Batch: {batch.batch_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        จำนวน: {batch.quantity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminIndex;