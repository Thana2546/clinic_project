import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  FaUserInjured,
  FaStethoscope,
  FaReceipt,
  FaPills,
} from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

function NurseIndex() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/nurse-dashboard/");
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
          กำลังโหลดสถานะคิวคนไข้...
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "คนไข้วันนี้",
      value: data.total_patients_today,
      icon: <FaUserInjured className="size-6" />,
      color: "bg-slate-100 text-slate-600",
    },
    {
      title: "รอตรวจสุขภาพ",
      value: data.waiting_for_vitals,
      icon: <FiActivity className="size-6" />,
      color: "bg-sky-100 text-sky-600",
    },
    {
      title: "รอพบแพทย์",
      value: data.waiting_for_doctor,
      icon: <FaStethoscope className="size-6" />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "รอชำระเงิน",
      value: data.waiting_for_payment,
      icon: <FaReceipt className="size-6" />,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "รอรับยา",
      value: data.waiting_for_medicine,
      icon: <FaPills className="size-6" />,
      color: "bg-teal-100 text-teal-600",
    },
    {
      title: "เสร็จสิ้น (Completed)",
      value: data.completed,
      icon: <FaCheckCircle className="size-6" />,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Nurse Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            ภาพรวมคิวคนไข้และสถานะการรับบริการประจำวัน
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center p-6 transition-shadow bg-white border shadow-sm border-blue-100 rounded-2xl hover:shadow-md"
          >
            <div className={`p-4 mr-5 rounded-full ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="text-3xl font-bold text-slate-800 mt-0.5">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NurseIndex;
