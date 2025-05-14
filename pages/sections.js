import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Login from "./Login";
import {useRouter} from "next/router";
import { useSession } from "next-auth/react";

export default function SectionManager() {
  const [sectionData, setSectionData] = useState({
    sectionID: "",
    course: "",
    yearLevel: "",
    semester: "",
    schoolYear: "",
    subjects: [],
  });

  // const [studentsToAdd, setStudentsToAdd] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // ✅ New state for all students
  const [sections, setSections] = useState([]);
  const [sectionIdToUpdate, setSectionIdToUpdate] = useState("");
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const router = useRouter();

  const { data: session } = useSession();


  
useEffect(() => {
  if (!session) return;
  if (!["superAdmin", "admin", "registrar"].includes(session.user.role)) {
    router.push("/");
  } else {
    fetchSections();
  }
}, [session, router]);

  const fetchSections = async () => {
    try {
      const res = await axios.get("/api/sections");
      setSections(res.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error fetching sections!";
      toast.error(errorMessage);
      console.error("Error fetching sections:", err);
    }
  };

  // const fetchFilteredStudents = useCallback(async () => {
  //   try {
  //     const res = await axios.get("/api/students/list", {
  //       params: {
  //         course: sectionData.course,
  //         yearLevel: sectionData.yearLevel,
  //         semester: sectionData.semester,
  //       },
  //     });
  //     setAllStudents(res.data.data);
  //   } catch (err) {
  //     const errorMessage = err.response?.data?.message || "Failed to load filtered students";
  //     toast.error(errorMessage);
  //     console.error(err);
  //   }
  // }, [sectionData.course, sectionData.yearLevel, sectionData.semester]);

  // useEffect(() => {
  //   if (sectionData.course && sectionData.yearLevel && sectionData.semester) {
  //     fetchFilteredStudents();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fetchFilteredStudents]);

    



  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...sectionData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value,
      schedule: updatedSubjects[index]?.schedule || {},
    };
    setSectionData({ ...sectionData, subjects: updatedSubjects });
  };

  const handleScheduleChange = (index, day, value) => {
    const updatedSubjects = [...sectionData.subjects];
    updatedSubjects[index].schedule = {
      ...updatedSubjects[index].schedule,
      [day]: value,
    };
    setSectionData({ ...sectionData, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setSectionData({
      ...sectionData,
      subjects: [...sectionData.subjects, { description: "", code: "", professor: "", schedule: {} }],
    });
  };

  // const deleteSubject = (index) => {
  //   const updatedSubjects = [...sectionData.subjects];
  //   updatedSubjects.splice(index, 1);
  //   setSectionData({ ...sectionData, subjects: updatedSubjects });
  // };

  const createSection = async () => {
    if (
      !sectionData.sectionID ||
      !sectionData.course ||
      !sectionData.yearLevel ||
      !sectionData.semester ||
      !sectionData.schoolYear
    ) {
      toast.error("Please fill in all fields for the new section");
      return;
    }
    try {
      const res = await axios.post("/api/sections", { ...sectionData, students: [] });
      toast.success("Section created successfully!");
      setSectionIdToUpdate(res.data.data._id);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error adding students!";
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // const addStudentsToSection = async () => {
  //   try {
  //     await axios.put("/api/sections", {
  //       id: sectionIdToUpdate,
  //       updates: { students: studentsToAdd },
  //     });

  //     toast.success("Students added to section successfully!");
  //   } catch (err) {
  //     const errorMessage = err.response?.data?.message || "Error adding students!";
  //     toast.error(errorMessage);
  //     console.error(err);
  //   }
  // };

  const updateSection = async () => {
    try {
      await axios.put("/api/sections", {
        id: sectionIdToUpdate,
        updates: sectionData,
      });
      toast.success("Section updated successfully!");
      fetchSections(); // Refresh
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error updating section!";
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const editSection = (section) => {
    setSectionData({
      sectionID: section.sectionID,
      course: section.course,
      yearLevel: section.yearLevel,
      semester: section.semester,
      schoolYear: section.schoolYear,
      subjects: section.subjects,
    });
    
    // // Preselect existing student IDs
    // const existingStudentIds = section.students.map((student) =>
    //   typeof student === "string" ? student : student._id
    // );
    // setStudentsToAdd(existingStudentIds);
    
    // setSectionIdToUpdate(section._id);
  };

  const handleDeleteClick = (id) => {
    setSectionToDelete(id);
  };
  
  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/sections?id=${sectionToDelete}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        fetchSections(); // Refresh the list
        toast.success("Section deleted successfully");
      } else {
        const errorMessage = (await res.json()).message || "Failed to delete section.";
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("An error occurred.");
    } finally {
      setSectionToDelete(null);
    }
  };

  return (
    <Login>
{sectionToDelete && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Are you sure you want to delete the section?
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        This action cannot be undone.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={confirmDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => setSectionToDelete(null)}
          className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      <Toaster />
      <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 space-y-6 border p-4 md:p-6 rounded-xl shadow-xl overflow-y-auto max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold dark:text-white">{sectionIdToUpdate ? "Edit Section" : "Create Section"}</h2>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
              fill="currentColor"
              className="text-white dark:text-gray-200"
              aria-hidden="true"
            >
              <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
            </svg>
            <span>Refresh Page</span>
          </button>

        </div>
          {["sectionID", "course", "yearLevel", "semester", "schoolYear"].map((field) => (
            <input
              key={field}
              placeholder={field}
              className="block w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={sectionData[field]}
              onChange={(e) => setSectionData({ ...sectionData, [field]: e.target.value })}
            />
          ))}
          <div className="flex justify-center mt-6 mb-4">
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-700 transition dark:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2"
            onClick={addSubject}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
            Add Subject
          </button>
          </div>
          {sectionData.subjects.map((subject, i) => (
            <div
              key={i}
              className="relative border p-4 rounded-md bg-white shadow-md dark:bg-gray-700 dark:border-gray-600"
            >
              {/* Delete button */}
              <button
                onClick={() => {
                  const updatedSubjects = [...sectionData.subjects];
                  updatedSubjects.splice(i, 1);
                  setSectionData({ ...sectionData, subjects: updatedSubjects });
                }}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                title="Delete Subject"
              >
                <b className="text-2xl">&#10005;</b>
              </button>
              <input
                placeholder="Description"
                value={subject.description}
                onChange={(e) => handleSubjectChange(i, "description", e.target.value)}
                className="block w-full p-3 border rounded-xl mb-3 dark:bg-gray-600 dark:text-white"
              />
              <input
                placeholder="Code"
                value={subject.code}
                onChange={(e) => handleSubjectChange(i, "code", e.target.value)}
                className="block w-full p-3 border rounded-xl mb-3 dark:bg-gray-600 dark:text-white"
              />
              <input
                placeholder="Professor"
                value={subject.professor}
                onChange={(e) => handleSubjectChange(i, "professor", e.target.value)}
                className="block w-full p-3 border rounded-xl mb-3 dark:bg-gray-600 dark:text-white"
              />

              {/* Schedule Selects */}
              {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
                <div key={day} className="mb-3">
                  <label className="block text-gray-700 mb-1 capitalize dark:text-gray-300">{day} schedule</label>
                  <select
                    value={subject.schedule?.[day] || ""}
                    onChange={(e) => handleScheduleChange(i, day, e.target.value)}
                    className="block w-full p-3 border rounded-xl dark:bg-gray-600 dark:text-white dark:border-gray-500"
                  >
                    <option value="">Select a time</option>
                    <option value="7:00AM - 8:00AM">7:00AM - 8:00AM</option>
                    <option value="8:00AM - 9:00AM">8:00AM - 9:00AM</option>
                    <option value="9:00AM - 10:00AM">9:00AM - 10:00AM</option>
                    <option value="10:00AM - 11:00AM">10:00AM - 11:00AM</option>
                    <option value="11:00AM - 12:00PM">11:00AM - 12:00PM</option>
                    <option value="12:00PM - 1:00PM">12:00PM - 1:00PM</option>
                    <option value="1:00PM - 2:00PM">1:00PM - 2:00PM</option>
                    <option value="2:00PM - 3:00PM">2:00PM - 3:00PM</option>
                    <option value="3:00PM - 4:00PM">3:00PM - 4:00PM</option>
                    <option value="4:00PM - 5:00PM">4:00PM - 5:00PM</option>
                    <option value="5:00PM - 6:00PM">5:00PM - 6:00PM</option>
                    <option value="6:00PM - 7:00PM">6:00PM - 7:00PM</option>
                    <option value="7:00AM - 8:30AM">7:00AM - 8:30AM</option>
                    <option value="8:30AM - 10:00AM">8:30AM - 10:00AM</option>
                    <option value="10:00AM - 11:30AM">10:00AM - 11:30AM</option>
                    <option value="11:30AM - 1:00PM">11:30AM - 1:00PM</option>
                    <option value="1:00PM - 2:30PM">1:00PM - 2:30PM</option>
                    <option value="2:30PM - 4:00PM">2:30PM - 4:00PM</option>
                    </select>
                  </div>
                ))}
              </div>
            ))}
          <div className="flex justify-center mt-4">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={sectionIdToUpdate ? updateSection : createSection}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#ffffff"
              >
                <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
              </svg>
              {sectionIdToUpdate ? "Update Section" : "Submit Section"}
            </button>
          </div>

          {/* ✅ STUDENT SELECTION
          {sectionIdToUpdate && (
            <>
              <h3 className="text-lg font-semibold mt-8 mb-2 dark:text-white">Add Students to Section</h3>
              <div className="border rounded-xl p-4 bg-white shadow-inner max-h-60 overflow-y-auto space-y-2 dark:bg-gray-700 dark:border-gray-600">
                {allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <label
                      key={student._id}
                      className="flex items-center p-2 border rounded-lg hover:bg-blue-50 transition-all duration-200 dark:hover:bg-blue-600"
                    >
                      <input
                        type="checkbox"
                        className="mr-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                        value={student._id}
                        checked={studentsToAdd.includes(student._id)}
                        onChange={(e) => {
                          const id = e.target.value;
                          setStudentsToAdd((prev) =>
                            e.target.checked ? [...prev, id] : prev.filter((s) => s !== id)
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {`${student._studentId} - ${student.fname} ${student.mname || ""} ${student.lname}`}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No students available to add.</p>
                )}
              </div>
  
              <button
                className="bg-indigo-600 text-white px-6 py-2 mt-4 rounded-full shadow-md hover:bg-indigo-700 transition dark:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2"
                onClick={addStudentsToSection}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#ffffff">
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
                </svg>
                Add Selected Students
              </button>

            </>
          )} */}
        </div>
  
        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 space-y-6 border p-4 md:p-6 rounded-xl shadow-xl overflow-y-auto max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold dark:text-white">All Sections</h2>
            <button
              onClick={fetchSections}
              className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2 rounded-full shadow-md hover:bg-gray-900 transition dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#e3e3e3"
              >
                <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
              </svg>
              Load Sections
            </button>

          </div>
  
          <div className="space-y-4">
            {sections.length > 0 ? (
              sections.map((sec) => (
                <div
                  key={sec._id}
                  className="border p-4 rounded-md bg-white shadow-md dark:bg-gray-700 dark:border-gray-600 flex justify-between flex-wrap"
                >
                  {/* Section Info */}
                  <div className="space-y-1 text-sm dark:text-gray-300">
                    <h3 className="text-lg font-semibold dark:text-white">
                      Section ID: {sec.sectionID}
                    </h3>
                    <p>Course: {sec.course}</p>
                    <p>Year Level: {sec.yearLevel}</p>
                    <p>Semester: {sec.semester}</p>
                    <p>School Year: {sec.schoolYear}</p>
                    <p>Subjects: {sec.subjects.length}</p>
                    <p>Students: {sec.students.length}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse md:flex-row gap-2 items-end mt-2 sm:mt-0 sm:ml-4">
                    <button
                      onClick={() => editSection(sec)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-200 hover:bg-yellow-400 text-yellow-700 rounded-md text-sm font-medium transition-all duration-200 dark:text-yellow-700 dark:hover:bg-yellow-600 dark:hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 -960 960 960"
                        fill="currentColor"
                      >
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                      </svg>
                      Edit Section
                    </button>
                  {(session?.user?.role === "admin" || session?.user?.role === "superAdmin")&&(<button
                      onClick={() => handleDeleteClick(sec._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-all duration-200 dark:bg-red-700 dark:hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18"
                        viewBox="0 -960 960 960"
                        width="18"
                        fill="currentColor"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h160v-40h320v40h160v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-320 440h80v-360h-80v360Zm160 0h80v-360h-80v360Z" />
                      </svg>
                      Delete
                    </button>)}
                    
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No sections loaded yet.</p>
            )}
          </div>

        </div>
      </div>
    </Login>
  );
}  