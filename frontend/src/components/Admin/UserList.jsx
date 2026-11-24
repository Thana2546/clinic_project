import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { GoXCircleFill } from "react-icons/go";

const UserList = ({ users }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">บัญชีผู้ใช้</th>
              <th className="px-6 py-4">อีเมล</th>
              <th className="px-6 py-4">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4">ตำแหน่ง</th>
              <th className="px-6 py-4 text-center">สถานะ</th>
              <th className="px-6 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <p>{u.username}</p>
                </td>
                <td className="px-6 py-4">
                  <p>{u.email || "-"}</p>
                </td>
                <td className="px-6 py-4">
                  {u.title ? `${u.title}` : ""}
                  {u.first_name} {u.last_name}
                </td>
                <td className="px-6 py-4 capitalize">
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-slate-700">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {u.is_active ? (
                      <FaCheckCircle className="text-emerald-500 size-4" />
                    ) : (
                      <GoXCircleFill className="text-rose-500 size-4" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    className="inline-flex cursor-pointer items-center px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100"
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
