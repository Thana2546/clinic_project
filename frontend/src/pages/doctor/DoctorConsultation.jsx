import { useState, useEffect } from "react";
import api from "../../api/axios";
import AsyncSelect from "react-select/async";
import { FaStethoscope, FaUser, FaPlus, FaCalendarDays } from "react-icons/fa6";
import { FaTrashAlt, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import { MdOutlineSaveAlt } from "react-icons/md";

import WaitingList from "../../components/Doctor/WaitingList";
import HistoryModal from "../../components/Doctor/HistoryModal";

function DoctorConsultation() {
  const [queues, setQueues] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [patientDetail, setPatientDetail] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [recordData, setRecordData] = useState({
    chief_complaint: "",
    treatment: "",
    doctor_fee: 0,
  });

  const [diagnoses, setDiagnoses] = useState([
    { icd10_code: "", description: "" },
  ]);

  const [prescriptions, setPrescriptions] = useState([]);
  const [followUp, setFollowUp] = useState({
    is_scheduled: false,
    date: "",
    time: "",
    note: "",
  });

  const fetchData = async () => {
    try {
      const queueRes = await api.get("/daily-queues/");
      setQueues(
        queueRes.data.filter((q) =>
          ["waiting_doctor", "in_progress"].includes(q.status),
        ),
      );
      const medRes = await api.get("/medicines/");
      setMedicines(medRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = async (queue) => {
    try {
      if (queue.status === "waiting_doctor")
        await api.patch(`/daily-queues/${queue.id}/change_status/`, {
          status: "in_progress",
        });
      setActiveQueue(queue);

      const vitalsRes = await api.get("/vitals/");
      setVitals(vitalsRes.data.find((v) => v.daily_queue === queue.id));

      try {
        const patRes = await api.get(`/patients/${queue.patient}/`);
        setPatientDetail(patRes.data);
      } catch (e) {
        console.log("Failed to fetch patient detail");
      }

      try {
        const recordRes = await api.get("/medical-records/");
        setPatientHistory(
          recordRes.data
            .filter((r) => r.patient === queue.patient)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        );
      } catch (e) {
        console.log("Failed to fetch history");
      }

      setRecordData({
        chief_complaint:
          vitalsRes.data.find((v) => v.daily_queue === queue.id)?.symptoms ||
          "",
        treatment: "",
        doctor_fee: 500,
      });
      setDiagnoses([{ icd10_code: "", description: "", selectedOption: null }]);
      setPrescriptions([]);
      setFollowUp({ is_scheduled: false, date: "", time: "", note: "" });
      fetchData();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเรียกคิวผู้ป่วย");
    }
  };

  const loadIcd10 = async (inputValue) => {
    try {
      const res = await api.get(`/ICD-10/?search=${inputValue || ""}`);
      const dataList = res.data.results || res.data;

      return dataList.slice(0, 100).map((item) => ({
        value: item.code,
        label: `${item.code} - ${item.description_th || ""}`,
        diseaseName: item.description_th || "",
      }));
    } catch (err) {
      console.error("Failed to load ICD-10 data", err);
      return [];
    }
  };

  const addDiagnosis = () =>
    setDiagnoses([
      ...diagnoses,
      { icd10_code: "", description: "", selectedOption: null },
    ]);

  const removeDiagnosis = (index) =>
    setDiagnoses(diagnoses.filter((_, i) => i !== index));

  const updateDiagnosis = (index, field, value) => {
    const newDiag = [...diagnoses];
    newDiag[index][field] = value;
    setDiagnoses(newDiag);
  };

  const handleIcd10Change = (index, selectedOption) => {
    const newDiag = [...diagnoses];
    newDiag[index].selectedOption = selectedOption;
    newDiag[index].icd10_code = selectedOption ? selectedOption.value : "";
    newDiag[index].description = selectedOption
      ? selectedOption.diseaseName
      : "";

    setDiagnoses(newDiag);
  };

  const addPrescription = () =>
    setPrescriptions([
      ...prescriptions,
      {
        medicine: "",
        quantity: 1,
        dosage: "",
        frequency: "",
        duration: "",
        instruction: "",
      },
    ]);
  const removePrescription = (index) =>
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  const updatePrescription = (index, field, value) => {
    const newPres = [...prescriptions];
    newPres[index][field] = value;
    setPrescriptions(newPres);
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const recordPayload = {
        patient: activeQueue.patient,
        daily_queue: activeQueue.id,
        ...recordData,
        diagnoses: diagnoses.filter((d) => d.description !== ""),
      };
      const recordRes = await api.post("/medical-records/", recordPayload);
      const medicalRecordId = recordRes.data.id;

      let nextStatus = "waiting_payment";
      const validPrescriptions = prescriptions.filter(
        (p) => p.medicine !== "" && p.quantity > 0,
      );

      if (validPrescriptions.length > 0) {
        await api.post("/prescriptions/", {
          patient: activeQueue.patient,
          medical_record: medicalRecordId,
          items: validPrescriptions,
        });
        nextStatus = "waiting_medicine";
      }

      if (followUp.is_scheduled && followUp.date) {
        await api.post("/follow-ups/", {
          medical_record_id: medicalRecordId,
          follow_up_date: followUp.date,
          follow_up_time: followUp.time || null,
          note: followUp.note,
        });
      }

      await api.patch(`/daily-queues/${activeQueue.id}/change_status/`, {
        status: nextStatus,
      });
      alert("บันทึกการตรวจรักษาสำเร็จ!");
      setActiveQueue(null);
      setVitals(null);
      setPatientDetail(null);
      setPatientHistory([]);
      fetchData();
    } catch (err) {
      alert("เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูลอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-6 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col gap-4 p-6 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-2xl border-blue-50">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-blue-900">
            <FaStethoscope className="mr-3 text-blue-600 size-6" />{" "}
            ห้องตรวจแพทย์
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบบันทึกการตรวจรักษา วินิจฉัยโรค สั่งจ่ายยา และนัดหมาย
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ใช้ Component ย่อยที่แยกออกไป */}
        <WaitingList
          queues={queues}
          loading={loading}
          activeQueue={activeQueue}
          handleCallPatient={handleCallPatient}
        />

        <div className="lg:col-span-3">
          {!activeQueue ? (
            <div className="flex flex-col items-center justify-center h-full text-center border border-dashed min-h-125 bg-slate-50 rounded-2xl border-slate-300 p-10">
              <div className="p-5 mb-5 bg-white rounded-full shadow-sm">
                <FaStethoscope className="text-blue-300 size-12" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-600">
                ยังไม่ได้เลือกผู้ป่วย
              </h2>
              <p className="font-medium text-slate-500">
                กรุณาเรียกคิวผู้ป่วยจากรายชื่อด้านซ้ายเพื่อเริ่มการตรวจรักษา
              </p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-blue-50">
              <div className="p-6 text-white bg-blue-700">
                <div className="flex flex-col gap-4 mb-5 sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-white/20">
                      <FaUser className="text-white size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-wide">
                        <span className="block mb-0.5 text-sm font-semibold text-blue-200">
                          คิวหมายเลข: {activeQueue.queue_number}
                        </span>
                        {activeQueue.patient_name}
                      </h2>
                      <p className="mt-0.5 text-sm text-blue-100">
                        รหัส: {activeQueue.hn_number}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors border rounded-xl bg-white/10 hover:bg-white/20 border-blue-400/30"
                  >
                    <FaHistory className="mr-2" /> ดูประวัติการรักษา
                  </button>
                </div>

                {patientDetail &&
                  (patientDetail.allergic || patientDetail.chronic) && (
                    <div className="flex items-start p-4 mb-4 border rounded-xl bg-rose-500/20 border-rose-400/40">
                      <FaExclamationTriangle className="mt-0.5 mr-3 text-rose-200 size-4 shrink-0" />
                      <div className="text-sm text-rose-50">
                        {patientDetail.allergic && (
                          <p>
                            <span className="font-bold text-rose-200">
                              แพ้ยา:
                            </span>{" "}
                            {patientDetail.allergic}
                          </p>
                        )}
                        {patientDetail.chronic && (
                          <p className={patientDetail.allergic ? "mt-1" : ""}>
                            <span className="font-bold text-rose-200">
                              โรคประจำตัว:
                            </span>{" "}
                            {patientDetail.chronic}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {vitals && (
                  <div className="grid grid-cols-2 gap-4 p-4 text-sm border rounded-xl bg-blue-800/50 md:grid-cols-4 border-blue-600/50">
                    <div>
                      <span className="block mb-1 text-xs text-blue-200">
                        ความดัน
                      </span>
                      <span className="text-sm font-bold">
                        {vitals.systolic_bp}/{vitals.diastolic_bp}
                      </span>
                    </div>
                    <div>
                      <span className="block mb-1 text-xs text-blue-200">
                        อุณหภูมิ
                      </span>
                      <span className="text-sm font-bold">
                        {vitals.temperature} °C
                      </span>
                    </div>
                    <div>
                      <span className="block mb-1 text-xs text-blue-200">
                        น้ำหนัก / ส่วนสูง
                      </span>
                      <span className="text-sm font-bold">
                        {vitals.weight}kg / {vitals.height}cm
                      </span>
                    </div>
                    <div>
                      <span className="block mb-1 text-xs text-blue-200">
                        ซักประวัติโดย
                      </span>
                      <span className="text-sm font-bold capitalize">
                        {vitals.recorded_by_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmitConsultation}
                className="p-6 space-y-8 md:p-8"
              >
                {/* 1. Record Data */}
                <div>
                  <h3 className="flex items-center pb-3 mb-5 font-bold border-b text-blue-900 border-blue-100">
                    <FiActivity className="mr-2 text-blue-600 size-5" />{" "}
                    บันทึกอาการและการรักษา
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block mb-1.5 text-sm font-bold text-slate-700">
                        อาการสำคัญ *
                      </label>
                      <textarea
                        required
                        rows="2"
                        className="w-full px-4 py-3 text-sm border resize-none rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        value={recordData.chief_complaint}
                        onChange={(e) =>
                          setRecordData({
                            ...recordData,
                            chief_complaint: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-bold text-slate-700">
                        รายละเอียดการรักษา *
                      </label>
                      <textarea
                        required
                        rows="3"
                        className="w-full px-4 py-3 text-sm border resize-none rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        value={recordData.treatment}
                        onChange={(e) =>
                          setRecordData({
                            ...recordData,
                            treatment: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="w-full md:w-1/3">
                      <label className="block mb-1.5 text-sm font-bold text-slate-700">
                        ค่าธรรมเนียมแพทย์ *
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2.5 text-sm border bg-white rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        value={recordData.doctor_fee}
                        onChange={(e) =>
                          setRecordData({
                            ...recordData,
                            doctor_fee: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Diagnosis */}
                <div>
                  <h3 className="pb-3 mb-5 font-bold border-b text-blue-900 border-blue-100">
                    การวินิจฉัยโรค
                  </h3>
                  <div className="space-y-3">
                    {diagnoses.map((diag, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-start gap-3 md:flex-row"
                      >
                        <div className="w-full md:w-1/2">
                          <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadIcd10}
                            value={diag.selectedOption}
                            onChange={(option) =>
                              handleIcd10Change(index, option)
                            }
                            placeholder="รหัส ICD-10..."
                            isClearable
                            className="text-sm"
                            formatOptionLabel={(option, { context }) => {
                              return context === "value"
                                ? option.value
                                : option.label;
                            }}
                            styles={{
                              control: (baseStyles) => ({
                                ...baseStyles,
                                borderRadius: "0.75rem",
                                borderColor: "#e2e8f0",
                                padding: "2px",
                                boxShadow: "none",
                                "&:hover": {
                                  borderColor: "#cbd5e1",
                                },
                              }),
                            }}
                          />
                        </div>
                        <div className="flex w-full gap-2 flex-1">
                          <input
                            type="text"
                            required
                            placeholder="รายละเอียดการวินิจฉัย *"
                            className="w-full px-4 py-2.5 text-sm border bg-white rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={diag.description}
                            onChange={(e) =>
                              updateDiagnosis(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                          {diagnoses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDiagnosis(index)}
                              className="p-3 transition-colors border border-transparent text-rose-500 hover:bg-rose-50 rounded-xl hover:border-rose-100"
                              title="ลบ"
                            >
                              <FaTrashAlt className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addDiagnosis}
                      className="inline-flex items-center px-4 py-2 mt-2 text-sm font-bold transition-colors text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100"
                    >
                      <FaPlus className="mr-2 size-3.5" /> เพิ่มการวินิจฉัย
                    </button>
                  </div>
                </div>

                {/* 3. Prescription */}
                <div>
                  <h3 className="pb-3 mb-5 font-bold border-b text-blue-900 border-blue-100">
                    สั่งจ่ายยา
                  </h3>
                  <div className="p-5 space-y-4 border bg-slate-50/80 rounded-2xl border-slate-200">
                    {prescriptions.map((pres, index) => (
                      <div
                        key={index}
                        className="grid items-start grid-cols-12 gap-3 p-4 bg-white border shadow-sm rounded-xl border-slate-200"
                      >
                        <div className="col-span-12 md:col-span-3">
                          <label className="block mb-1.5 text-xs font-bold text-slate-600">
                            เลือกยา *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={pres.medicine}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                "medicine",
                                e.target.value,
                              )
                            }
                          >
                            <option value="">-- เลือกยา --</option>
                            {medicines.map((m) => {
                              const isUnavailable = m.active_stock <= 0;

                              return (
                                <option
                                  key={m.id}
                                  value={m.id}
                                  disabled={isUnavailable}
                                  className={
                                    isUnavailable
                                      ? "text-slate-400 bg-slate-50"
                                      : "text-slate-800"
                                  }
                                >
                                  {m.drug_name} ({m.unit}){" "}
                                  {isUnavailable ? "ยาหมด/หมดอายุ" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <label className="block mb-1.5 text-xs font-bold text-slate-600">
                            จำนวน *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={pres.quantity}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block mb-1.5 text-xs font-bold text-slate-600">
                            ขนาด/โดส
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น 1 เม็ด"
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={pres.dosage}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                "dosage",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block mb-1.5 text-xs font-bold text-slate-600">
                            ความถี่
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น หลังอาหาร"
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={pres.frequency}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                "frequency",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-span-10 md:col-span-2">
                          <label className="block mb-1.5 text-xs font-bold text-slate-600">
                            ระยะเวลา *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="เช่น 5 วัน"
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={pres.duration}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-end justify-center pb-1.5 col-span-2 md:col-span-1">
                          <button
                            type="button"
                            onClick={() => removePrescription(index)}
                            className="p-2 transition-colors rounded-lg text-rose-500 hover:bg-rose-50"
                            title="ลบยา"
                          >
                            <FaTrashAlt className="size-4" />
                          </button>
                        </div>
                        <div className="col-span-12 mt-2">
                          <input
                            type="text"
                            placeholder="คำแนะนำพิเศษ..."
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            value={pres.instruction}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                "instruction",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPrescription}
                      className="inline-flex items-center px-4 py-2 mt-2 text-sm font-bold transition-colors bg-white border shadow-sm text-slate-700 border-slate-300 rounded-xl hover:bg-slate-50"
                    >
                      <FaPlus className="mr-2 size-3.5" /> เพิ่มรายการยา
                    </button>
                  </div>
                </div>

                {/* 4. Follow-up */}
                <div>
                  <h3 className="flex items-center pb-3 mb-5 font-bold border-b text-blue-900 border-blue-100">
                    <FaCalendarDays className="mr-2 text-blue-600 size-5" />{" "}
                    การนัดหมาย
                  </h3>
                  <div
                    className={`p-5 rounded-2xl border transition-colors ${followUp.is_scheduled ? "bg-blue-50/50 border-blue-200" : "bg-slate-50 border-slate-200"}`}
                  >
                    <label className="flex items-center mb-4 space-x-3 font-bold cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={followUp.is_scheduled}
                        onChange={(e) =>
                          setFollowUp({
                            ...followUp,
                            is_scheduled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>นัดหมายผู้ป่วยครั้งต่อไป</span>
                    </label>
                    {followUp.is_scheduled && (
                      <div className="grid grid-cols-1 gap-4 p-5 mt-2 bg-white border shadow-sm md:grid-cols-4 rounded-xl border-blue-100">
                        <div className="md:col-span-1">
                          <label className="block mb-1.5 text-sm font-bold text-slate-700">
                            วันที่นัดหมาย *
                          </label>
                          <input
                            type="date"
                            required
                            value={followUp.date}
                            onChange={(e) =>
                              setFollowUp({ ...followUp, date: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block mb-1.5 text-sm font-bold text-slate-700">
                            เวลา
                          </label>
                          <input
                            type="time"
                            value={followUp.time}
                            onChange={(e) =>
                              setFollowUp({ ...followUp, time: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-1.5 text-sm font-bold text-slate-700">
                            เหตุผลการนัดหมาย
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น ดูอาการ..."
                            value={followUp.note}
                            onChange={(e) =>
                              setFollowUp({ ...followUp, note: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-8 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQueue(null);
                      setPatientDetail(null);
                      setPatientHistory([]);
                    }}
                    className="px-6 py-3 text-sm font-bold transition-colors bg-white border shadow-sm rounded-xl text-slate-600 border-slate-300 hover:bg-slate-50"
                  >
                    พักคิว (Hold)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 text-sm font-bold text-white transition-colors shadow-sm bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      "กำลังบันทึก..."
                    ) : (
                      <>
                        <MdOutlineSaveAlt className="mr-2 size-5" />{" "}
                        บันทึกและเสร็จสิ้น
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <HistoryModal
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        patientHistory={patientHistory}
        activeQueue={activeQueue}
      />
    </div>
  );
}

export default DoctorConsultation;
