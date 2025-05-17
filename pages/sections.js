import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Login from "./Login";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
export default function SectionManager() {
  const [sections, setSections] = useState([]);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  // const [newStudents, setNewStudents] = useState({});
  // const [fromSection, setFromSection] = useState("");
  const [moveTarget, setMoveTarget] = useState({});
  // const [toSection, setToSection] = useState("");
  // const [message, setMessage] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) return;
    if (
      !["superAdmin", "registrar", "programHeads"].includes(session.user.role)
    ) {
      router.push("/");
    }
  }, [session, router]);
  const fetchSections = async () => {
    try {
      const res = await axios.get("/api/sections");
      const sectionList = res.data.data;
      setSections(sectionList);
      for (const sec of sectionList) {
        await fetchAvailableStudents(
          sec._id,
          sec.course,
          sec.yearLevel,
          sec.semester
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching sections!");
    }
  };
  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/sections?id=${sectionToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSections();
        toast.success("Section deleted successfully");
      } else {
        const errorMessage =
          (await res.json()).message || "Failed to delete section.";
        toast.error(errorMessage);
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setSectionToDelete(null);
    }
  };
  // const handleSelectChange = (sectionId, studentId) => {
  //   setNewStudents((prev) => ({ ...prev, [sectionId]: studentId }));
  // };
  // const handleAddStudent = async (sectionId) => {
  //   const identifier = newStudents[sectionId];
  //   try {const res = await axios.patch("/api/students/list", { sectionId, identifier });
  //     if (res.data.success) {
  //       toast.success("Student added to section!");
  //       fetchSections();
  //       setNewStudents((prev) => ({ ...prev, [sectionId]: "" }));
  //     } else {toast.error(res.data.message || "Failed to add student.");
  //     }} catch (err) {toast.error(err.response?.data?.message || "Error adding student.");}
  // };   if (!identifier) return toast.error("Please select a student.");
  const handleMoveStudent = async (studentId, fromSectionId, toSectionId) => {
    try {
      const res = await axios.post("/api/sections/move-student", {
        studentId,
        fromSectionId,
        toSectionId,
      });

      if (res.data.success) {
        toast.success("Student moved successfully.");
        setMoveTarget((prev) => ({ ...prev, [studentId]: "" }));
        fetchSections();
      } else {
        toast.error(res.data.message || "Failed to move student.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to move student.");
    }
  };
  const fetchAvailableStudents = async (
    sectionId,
    course,
    yearLevel,
    semester
  ) => {
    try {
      const res = await axios.get("/api/students/list", {
        params: { course, yearLevel, semester },
      });
      if (res.data.success) {
        setSections((prev) =>
          prev.map((s) =>
            s._id === sectionId ? { ...s, availableStudents: res.data.data } : s
          )
        );
      }
    } catch {
      toast.error("Failed to fetch students.");
    }
  };
  const year = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
  };
  return (
    <Login>
      <Toaster />
      {sectionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this section? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setSectionToDelete(null)}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 md:p-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Sections
            </h2>
            <div className="flex gap-3">
              <button
                onClick={fetchSections}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow"
              >
                Reload
              </button>
              {(session?.user?.role === "programHeads" ||
                session?.user?.role === "superAdmin") && (
                <Link
                  href="/sections/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  + New Section
                </Link>
              )}
            </div>
          </div>
          {sections.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No sections found.
            </p>
          ) : (
            sections.map((sec) => (
              <div
                key={sec._id}
                className="border dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-900 space-y-4"
              >
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Section ID: {sec.sectionID}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sec.course} • {year[sec.yearLevel]} • {sec.semester}{" "}
                      <br />
                      SY: {sec.schoolYear} | Subjects: {sec.subjects.length} |
                      Students: {sec.students.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(session?.user?.role === "programHeads" ||
                      session?.user?.role === "superAdmin") && (
                      <Link
                        href={`/sections/edit/${sec._id}`}
                        className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md text-sm"
                      >
                        Edit
                      </Link>
                    )}
                    {(session?.user?.role === "programHeads" ||
                      session?.user?.role === "superAdmin") && (
                      <button
                        onClick={() => setSectionToDelete(sec._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-white mb-2">
                    Enrolled Students
                  </h4>
                  {sec.students.length > 0 ? (
                    <div className="overflow-x-auto rounded-md border dark:border-gray-700">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left">#</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Student ID</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Move</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-600">
                          {sec.students.map((student, i) => (
                            <tr
                              key={student._id}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-2">{i + 1}</td>
                              <td className="px-4 py-2">
                                {student.fname} {student.mname} {student.lname}
                              </td>
                              <td className="px-4 py-2">
                                {student._studentId}
                              </td>
                              <td className="px-4 py-2">{student.email}</td>
                              <td className="px-4 py-2">
                                <select
                                  className="p-1 border rounded text-sm"
                                  value={moveTarget[student._id] || ""}
                                  onChange={(e) =>
                                    setMoveTarget((prev) => ({
                                      ...prev,
                                      [student._id]: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Move to...</option>
                                  {sections
                                    .filter((s) => s._id !== sec._id)
                                    .map((s) => (
                                      <option key={s._id} value={s._id}>
                                        {s.sectionID} • {s.course}{" "}
                                        {year[s.yearLevel]} {s.semester}
                                      </option>
                                    ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  disabled={!moveTarget[student._id]}
                                  onClick={() =>
                                    handleMoveStudent(
                                      student._id,
                                      sec._id,
                                      moveTarget[student._id]
                                    )
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                >
                                  Move
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No students enrolled.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Login>
  );
}
