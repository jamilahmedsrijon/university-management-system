import { useEffect, useMemo, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import TeacherLayout from "../../layouts/TeacherLayout";

const perPage = 6;
const defaultSemesters = ["Spring 2026", "Summer 2026", "Fall 2026"];
const allDepartmentsOption = "All Departments";

const formatText = (value, fallback = "N/A") => value || fallback;
const formatAmount = (amount) =>
  `BDT ${new Intl.NumberFormat("en-US").format(Number(amount || 0))}`;

function Students() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState(defaultSemesters);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemesters[0]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeAmount, setFeeAmount] = useState("");
  const [submittingFee, setSubmittingFee] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/teacher/students", {
          params: {
            semester: selectedSemester,
            department: selectedDepartment || undefined,
          },
        });

        if (!isMounted) {
          return;
        }

        setStudents(response.data?.students || []);
        setAvailableSemesters(
          response.data?.available_semesters?.length
            ? response.data.available_semesters
            : defaultSemesters
        );
        setAvailableDepartments(response.data?.available_departments || []);
        setSelectedSemester(
          response.data?.selected_semester || selectedSemester
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load students right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [selectedDepartment, selectedSemester]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDepartment, selectedSemester]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const haystack = [
          student.name,
          student.email,
          student.department,
          student.session,
          student.status,
          student.current_fee?.semester,
          String(student.id),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      }),
    [normalizedSearch, students]
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const data = filteredStudents.slice(startIndex, startIndex + perPage);

  const openFeeModal = (student) => {
    setSelectedStudent(student);
    setFeeAmount(
      student.current_fee?.amount ? String(student.current_fee.amount) : ""
    );
    setError("");
    setSuccessMessage("");
  };

  const closeFeeModal = () => {
    if (submittingFee) {
      return;
    }

    setSelectedStudent(null);
    setFeeAmount("");
  };

  const handleFeeSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStudent) {
      return;
    }

    const numericAmount = Number(feeAmount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setSuccessMessage("");
      setError("Please enter a valid fee amount.");
      return;
    }

    setSubmittingFee(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = selectedStudent.current_fee?.id
        ? await api.put(`/fees/${selectedStudent.current_fee.id}`, {
            amount: numericAmount,
          })
        : await api.post(`/fees/create/${selectedStudent.id}`, {
            amount: numericAmount,
            semester: selectedSemester,
          });

      const savedFee = response.data?.data;

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                current_fee: savedFee
                  ? {
                      id: savedFee.id,
                      semester: savedFee.semester,
                      amount: savedFee.amount,
                      status: savedFee.status,
                      payment_method: savedFee.payment_method,
                    }
                  : student.current_fee,
              }
            : student
        )
      );

      setSuccessMessage(
        response.data?.message ||
          (selectedStudent.current_fee?.id
            ? "Fee updated successfully."
            : "Fee created successfully.")
      );
      setSelectedStudent(null);
      setFeeAmount("");
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Unable to save fee right now."
      );
    } finally {
      setSubmittingFee(false);
    }
  };

  return (
    <TeacherLayout title="Students">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <label className="text-sm font-medium text-gray-600">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">{allDepartmentsOption}</option>
            {availableDepartments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <label className="text-sm font-medium text-gray-600">Semester</label>
          <select
            value={selectedSemester}
            onChange={(event) => {
              setSelectedSemester(event.target.value);
              setSelectedStudent(null);
            }}
            className="rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {availableSemesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        You are managing fees for <span className="font-semibold">{selectedSemester}</span>
        {selectedDepartment
          ? ` in ${selectedDepartment}.`
          : "."}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 shadow">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <Loader message={`Loading ${selectedSemester} students...`} />
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Semester Fee</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((student) => {
                  const currentFee = student.current_fee;
                  const isPaid = currentFee?.status === "paid";

                  return (
                    <tr
                      key={student.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-800">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {student.id}
                        </div>
                      </td>

                      <td className="p-4 text-gray-600">
                        {formatText(student.email)}
                      </td>

                      <td className="p-4 text-gray-600">
                        {formatText(student.department)}
                      </td>

                      <td className="p-4">
                        {currentFee ? (
                          <div>
                            <div className="font-semibold text-gray-800">
                              {formatAmount(currentFee.amount)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {currentFee.semester}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {currentFee ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isPaid
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No fee</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => openFeeModal(student)}
                          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                        >
                          {currentFee ? "Update Fee" : "Add Fee"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No students found for this semester view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedStudent.current_fee ? "Update Fee" : "Add Fee"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedStudent.name} (ID: {selectedStudent.id})
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Semester: {selectedSemester}
              </p>
            </div>

            <form onSubmit={handleFeeSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <input
                  type="text"
                  value={selectedSemester}
                  readOnly
                  className="w-full rounded-lg border bg-gray-50 p-3 text-gray-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fee Amount
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={feeAmount}
                  onChange={(event) => setFeeAmount(event.target.value)}
                  className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter amount"
                  disabled={submittingFee}
                />
              </div>

              {selectedStudent.current_fee?.status === "paid" && (
                <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                  This fee is already paid. Amount update is disabled.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeFeeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                  disabled={submittingFee}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submittingFee || selectedStudent.current_fee?.status === "paid"
                  }
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submittingFee
                    ? "Saving..."
                    : selectedStudent.current_fee
                    ? "Update Fee"
                    : "Add Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default Students;
