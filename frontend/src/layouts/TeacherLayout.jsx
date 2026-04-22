import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuthStorage, getStoredUser } from "../axios";
import Footer from "../components/Footer";

function TeacherLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(true);
  const [dropdown, setDropdown] = useState(false);
  const currentUser = getStoredUser();

  const menu = [
    { name: "Dashboard", path: "/teacher/dashboard" },
    { name: "Students", path: "/teacher/students" },
    { name: "Add Results", path: "/teacher/results" },
    { name: "Notices", path: "/teacher/notices" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className={`
        bg-gradient-to-b from-purple-700 to-indigo-900 text-white
        transition-all duration-300
        ${open ? "w-64" : "w-0 overflow-hidden"}
      `}>

        <div className="p-6 text-2xl font-bold border-b border-white/20">
          Teacher Panel
        </div>

        <ul className="p-4 space-y-3 text-sm">
          {menu.map((m, i) => (
            <li
              key={i}
              onClick={() => navigate(m.path)}
              className={`p-2 rounded cursor-pointer transition
                ${location.pathname === m.path
                  ? "bg-purple-600"
                  : "hover:bg-purple-600"}
              `}
            >
              {m.name}
            </li>
          ))}
        </ul>

      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="flex justify-between items-center bg-white px-4 md:px-6 py-4 shadow">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setOpen(!open)}
              className="bg-purple-600 text-white px-3 py-2 rounded-md"
            >
              ☰
            </button>

            <h1 className="text-lg md:text-xl font-semibold text-gray-700">
              {title}
            </h1>

          </div>

          {/* Profile Dropdown */}
          <div className="relative">

            <div
              onClick={() => setDropdown(!dropdown)}
              className="cursor-pointer bg-gray-200 px-4 py-2 rounded-full"
            >
              {currentUser?.name || "Teacher"}
            </div>

            {dropdown && (
              <div className="absolute right-0 mt-2 bg-white shadow rounded-lg w-40">

                <button
                  onClick={() => navigate("/")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Home
                </button>

                <button
                  onClick={() => {
                    clearAuthStorage();
                    navigate("/login");
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Content (FIXED) */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}

export default TeacherLayout;