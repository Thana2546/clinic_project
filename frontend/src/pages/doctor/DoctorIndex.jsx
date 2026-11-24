import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { FaClipboardList, FaUser } from "react-icons/fa6";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";

function DoctorIndex() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/doctor-dashboard/");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="font-medium text-blue-600 animate-pulse">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Doctor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            ภาพรวมสถานะคิวผู้ป่วยและการตรวจรักษาประจำวัน
          </p>
        </div>
      </div>

      {/* Current Patient Highlight */}
      <div className="relative p-6 overflow-hidden bg-white border shadow-sm rounded-2xl border-blue-100">
        {/* แถบสีตกแต่งด้านซ้าย */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>

        <div className="flex items-center mb-5">
          <FaUser className="mr-3 text-blue-600 size-5" />
          <h2 className="text-lg font-bold text-blue-900">
            ผู้ป่วยที่กำลังตรวจ
          </h2>
        </div>

        {data.current_patient ? (
          <div className="flex flex-col items-center justify-between p-5 border sm:flex-row bg-blue-50/50 rounded-xl border-blue-100">
            <div>
              <p className="mb-1 text-xs font-bold tracking-wider text-blue-600 uppercase">
                คิวหมายเลข (Queue): {data.current_patient.queue_number}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {data.current_patient.patient_name}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                รหัสประจำตัว (HN): {data.current_patient.hn_number}
              </p>
            </div>
            <Link
              to="/doctor/queue"
              className="flex items-center justify-center w-full px-6 py-3 mt-4 text-sm font-bold text-white transition-colors bg-blue-600 shadow-sm sm:w-auto sm:mt-0 rounded-xl hover:bg-blue-700"
            >
              ไปที่หน้าบันทึกการรักษา <FaArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed rounded-xl border-slate-200 bg-slate-50/50">
            <p className="font-medium text-slate-500">
              ไม่มีผู้ป่วยที่กำลังตรวจ กรุณาเรียกคิวถัดไปจากหน้าจัดการคิว
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="flex items-center p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-blue-50 hover:shadow-md">
          <div className="p-4 mr-5 rounded-full bg-sky-50 text-sky-600">
            <FaUser className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              รอตรวจ
            </p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800">
              {data.waiting_patients}
            </p>
          </div>
        </div>

        <div className="flex items-center p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-blue-50 hover:shadow-md">
          <div className="p-4 mr-5 rounded-full bg-emerald-50 text-emerald-600">
            <FaCheckCircle className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              ตรวจเสร็จแล้ว
            </p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800">
              {data.completed_today}
            </p>
          </div>
        </div>

        <div className="flex items-center p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-blue-50 hover:shadow-md">
          <div className="p-4 mr-5 rounded-full bg-indigo-50 text-indigo-600">
            <FaClipboardList className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              คิวทั้งหมดวันนี้
            </p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800">
              {data.total_queue_today}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorIndex;