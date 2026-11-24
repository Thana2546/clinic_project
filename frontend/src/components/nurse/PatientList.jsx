import { FaSearch, FaArrowRight, FaEdit } from "react-icons/fa";

const PatientList = ({
  patients,
  loading,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  handleAddWalkInQueue,
  handleEditClick,
}) => {
  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
      <div className="flex flex-col justify-between gap-4 p-5 bg-white border-b border-slate-200 md:flex-row md:items-center">
        <h2 className="flex items-center font-bold text-slate-800">
          ค้นหาฐานข้อมูลผู้ป่วย (Walk-in)
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full gap-2 md:max-w-md"
        >
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัส HN หรือ เลขบัตรประชาชน..."
            className="flex-1 px-4 py-2.5 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="flex cursor-pointer items-center px-4 py-2.5 text-white transition-colors bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700"
          >
            <FaSearch className="size-4" />
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="font-semibold border-b bg-slate-50 text-slate-700 border-slate-200">
            <tr>
              <th className="px-6 py-4">รหัส HN</th>
              <th className="px-6 py-4">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4">เบอร์โทรศัพท์</th>
              <th className="px-6 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-8 font-medium text-center text-blue-500 animate-pulse"
                >
                  กำลังค้นหาข้อมูล...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-8 text-center text-slate-500 bg-slate-50/50"
                >
                  ไม่พบข้อมูลผู้ป่วย
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 font-bold text-blue-700">
                    {p.hn_number}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {p.title}{p.first_name} {p.last_name}
                  </td>
                  <td className="px-6 py-4">{p.phone || "-"}</td>
                  <td className="flex justify-end gap-2 px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="cursor-pointer inline-flex items-center px-3.5 py-2 text-xs font-bold transition-colors border shadow-sm bg-amber-50 text-amber-700 border-amber-200 rounded-xl hover:bg-amber-100"
                      title="แก้ไขข้อมูลผู้ป่วย"
                    >
                      <FaEdit className="mr-1.5 size-3.5" /> แก้ไข
                    </button>
                    <button
                      onClick={() => handleAddWalkInQueue(p.id)}
                      className="cursor-pointer inline-flex items-center px-3.5 py-2 text-xs font-bold transition-colors border shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200 rounded-xl hover:bg-emerald-100"
                    >
                      ส่งเข้าคิว{" "}
                      <FaArrowRight className="ml-1.5 size-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
