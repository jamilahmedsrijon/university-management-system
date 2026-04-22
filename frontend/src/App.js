import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import Profile from "./pages/student/Profile";
import MyResults from "./pages/student/MyResults";
import Fees from "./pages/student/Fees";
import AdmitCard from "./pages/student/AdmitCard";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Students from "./pages/teacher/Students";
import AddResult from "./pages/teacher/AddResult";
import Notices from "./pages/teacher/Notices";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute role="student">
              <MyResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute role="student">
              <Fees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/admit"
          element={
            <ProtectedRoute role="student">
              <AdmitCard />
            </ProtectedRoute>
          }
        />

        {/* Teacher */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute role="teacher">
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/results"
          element={
            <ProtectedRoute role="teacher">
              <AddResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/notices"
          element={
            <ProtectedRoute role="teacher">
              <Notices />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
