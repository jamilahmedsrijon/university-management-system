import TeacherLayout from "../../layouts/TeacherLayout";

function TeacherDashboard() {

  return (
    <TeacherLayout title="Dashboard">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Total Students</p>
            <h2 className="text-3xl font-bold text-purple-600">1</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Pending Results</p>
            <h2 className="text-3xl font-bold text-red-500">0</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Notices</p>
            <h2 className="text-3xl font-bold text-green-500">2</h2>
          </div>

        </div>

        {/* Buttons */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
            Add Results
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
            View Students
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
            Create Notice
          </div>

        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">

          <h2 className="font-semibold text-lg">Recent Activity</h2>

          <div className="space-y-3">

            <div className="p-4 bg-gray-100 rounded-lg">
              Result added for srijon (ML)
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              Student registered: srijon
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              Notice published
            </div>

          </div>

        </div>

      </div>

    </TeacherLayout>
  );
}

export default TeacherDashboard;