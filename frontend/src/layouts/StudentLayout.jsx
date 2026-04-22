import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage } from "../axios";
import Footer from "../components/Footer";

function StudentLayout({ children, title, role = "student" }) {

  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const isTeacher = role === "teacher";

  const bgColor = isTeacher
    ? "from-purple-700 to-indigo-900"
    : "from-blue-700 to-blue-900";

  const hoverColor = isTeacher
    ? "hover:bg-purple-600"
    : "hover:bg-blue-600";

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className={`
        bg-gradient-to-b ${bgColor} text-white
        transition-all duration-300
        ${open ? "w-64" : "w-0 overflow-hidden"}
      `}>

        <div className="p-6 text-2xl font-bold border-b border-white/20">
          {isTeacher ? "Teacher Panel" : "UMS"}
        </div>

        <ul className="p-4 space-y-3 text-sm">

          <li
            onClick={() => navigate(isTeacher ? "/teacher/dashboard" : "/student")}
            className={`p-2 rounded cursor-pointer ${hoverColor}`}
          >
            Dashboard
          </li>

          {!isTeacher && (
            <>
              <li onClick={() => navigate("/student/results")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>My Results</li>
              <li onClick={() => navigate("/student/fees")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>Fees</li>
              <li onClick={() => navigate("/student/admit")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>Admit Card</li>
              <li onClick={() => navigate("/student/profile")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>Profile</li>
            </>
          )}

          {isTeacher && (
            <>
              <li onClick={() => navigate("/teacher/students")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>Students</li>
              <li onClick={() => navigate("/teacher/results")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>Add Results</li>
              <li onClick={() => navigate("/teacher/notices")} className={`p-2 rounded cursor-pointer ${hoverColor}`}>Notices</li>
            </>
          )}

        </ul>

      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="flex justify-between items-center bg-white px-4 py-4 shadow">

          <button
            onClick={() => setOpen(!open)}
            className="bg-gray-800 text-white px-3 py-2 rounded"
          >
            ☰
          </button>

          <h1 className="font-semibold">{title}</h1>

          <button
            onClick={() => {
              clearAuthStorage();
              navigate("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {children}
        </div>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}

export default StudentLayout;