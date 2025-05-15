import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Login from './Login';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/Loading';


export default function ManageSubjects() {
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState(null);
  const [newSubject, setNewSubject] = useState({
    code: '',
    description: '',
    units: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [curriculumSubjects, setCurriculumSubjects] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, code: '' });
  const [form, setForm] = useState({
    course: '',
    yearLevel: '',
    semester: '',
    subjects: [{ code: '', description: '', units: '' }],
  }); 
  const { data: session, status } = useSession(); 

  const router = useRouter();

  useEffect(() => {
  async function fetchCurriculumSubjects() {
    try {
      const { course, yearLevel, semester } = form;

      // Only fetch if all are selected
      if (!course || !yearLevel || !semester) {
        setCurriculumSubjects([]); // optionally clear previous data
        return;
      }

      const res = await axios.get('/api/curriculum-subjects', {
        params: { course, yearLevel, semester },
      });
      setCurriculumSubjects(res.data);
    } catch (error) {
      console.error('Failed to load curriculum subjects:', error);
      toast.error('Failed to load curriculum subjects');
    }
  }
  fetchCurriculumSubjects();
}, [form]);

 if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // If not logged in
  if (!session) {
    return <Login />;
  }

  
  // If logged in but not authorized
  const allowedRoles = ['superAdmin', 'registrar', 'admin'];
  if (!allowedRoles.includes(session.user.role)) {
    if (typeof window !== "undefined") {
      router.push('/'); // Redirect to home or another page
    }
    return null;
  }

  

  const handleSubjectChange = (index, field, value) => {
    const updated = [...form.subjects];
    updated[index][field] = value;
    setForm({ ...form, subjects: updated });
  };

  const addSubjectField = () => {
    setForm({
      ...form,
      subjects: [...form.subjects, { code: '', description: '', units: '' }],
    });
  };

  const removeSubjectField = (index) => {
    setForm({
      ...form,
      subjects: form.subjects.filter((_, i) => i !== index),
    });
  };
const handleSubmit = async () => {
  const { course, yearLevel, semester, subjects } = form;

  if (
    !course ||
    !yearLevel ||
    !semester ||
    subjects.some((s) => !s.code || !s.description || !s.units)
  ) {
    toast.error('Please fill in all fields.');
    return;
  }

  setLoading(true);
  try {
    // Submit all subjects in the 'subjects' array
    const response = await axios.post('/api/subject-mappings', {
      course,
      yearLevel: Number(yearLevel), // Ensure it's treated as a number
      semester,
      subjects, // Pass the array of subjects instead of just a single subject
    });

    if (response.data.success) {
      toast.success('Subjects added successfully!');
      setForm({
        course: '',
        yearLevel: '',
        semester: '',
        subjects: [{ code: '', description: '', units: '' }], // Reset form to default state
      });
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Submission failed.';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

 const fetchStudent = async () => {
  if (!studentId) {
    toast.error('Please enter a student ID');
    return;
  }
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get(`/api/subjects?id=${studentId}`);
    setStudent(res.data);
  } catch (err) {
    console.error(err);
    const errorMsg =
      err.response?.data?.error || 'An unexpected error occurred';
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  const addSubject = async () => {
  if (!newSubject.code || !newSubject.description || !newSubject.units) {
    toast.error('Please fill in all fields for the new subject');
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(`/api/subjects?id=${studentId}`, newSubject);
    setStudent(res.data);
    toast.success('Subject added successfully');
    setNewSubject({ code: '', description: '', units: '' });
  } catch (error) {
    // Check if backend sent an error message
    const message = error.response?.data?.error || 'Failed to add subject';
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const deleteSubject = async (code) => {
    setLoading(true);
    try {
      const res = await axios.delete(`/api/subjects?id=${studentId}&code=${code}`);
      setStudent(res.data);
      toast.success('Subject deleted successfully');
    } catch {
      toast.error('Error deleting subject');
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, code: '' });
    }
  };


  

  return (
  <Login>
    <Toaster position="top-right" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left side - Create Subject */}
        {(session.user.role === 'admin' || session.user.role === 'superAdmin')&&(<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-6 flex justify-between pt-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white text-center">Add Curriculum</h2>
          <div> 
            <Link href="/subjects/view-curriculum" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 transition-transform hover:scale-105 duration-300 shadow-md px-4 rounded">View Curriculum</Link>
          </div>
          </div>
          <div className="grid gap-6 mb-6">
            <div className="flex gap-6">
              <select
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value.toUpperCase() })}
                className="border px-4 py-3 w-full rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Course</option>
                <option value="BSCS">BSCS</option>
                <option value="BSHM">BSHM</option>
                <option value="BSBA">BSBA</option>
                <option value="BSTM">BSTM</option>
                <option value="BEED">BEED</option>
                <option value="BSED-ENG">BSED-ENG</option>
                <option value="BSED-MATH">BSED-MATH</option>
                <option value="BA-POLSCI">BA-POLSCI</option>
              </select>
              <select
                value={form.yearLevel}
                onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
                className="border px-4 py-3 w-full rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="border hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-3 w-full rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Semester</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>
          </div>

          {form.subjects.map((subject, index) => (
            <div key={index} className="mb-6">
              <div className="mb-2 flex justify-center items-center">
              <label className="text-gray-900 dark:text-white block text-lg font-bold mb-2 dark:text-white">Subject {index + 1}
              </label></div>
              <input
                type="text"
                placeholder="Code"
                value={subject.code}
                onChange={(e) => handleSubjectChange(index, 'code', e.target.value)}
                className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white placeholder:text-gray-500  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={subject.description}
                onChange={(e) => handleSubjectChange(index, 'description', e.target.value)}
                className="border px-4 hover:bg-gray-200 dark:hover:bg-gray-700 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Units"
                value={subject.units}
                onChange={(e) => handleSubjectChange(index, 'units', e.target.value)}
                className="border hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none placeholder:text-gray-500  focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end items-end">
              {form.subjects.length > 1 && (
                <button
                  onClick={() => removeSubjectField(index)}
                  className="text-red-600 hover:scale-105 border-b-2 border-red-600 hover:text-red-600 text-lg mt-1 md:col-span-3"
                >
                  Remove
                </button>
              )}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4 justify-center items-center mt-4">
            <div className="col-span-1 flex justify-center">
              <button
                onClick={addSubjectField}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm transition-transform hover:scale-105 w-full"
              >
                Add Another Subject
              </button>
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 w-full"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Save Curriculum'}
              </button>
            </div>
          </div>
        </div>)}
        

        {/* Right side - Search for Student */}
        <div className={`${!(session.user.role === 'admin' || session.user.role === 'superAdmin') ? 'flex justify-center' : ''}`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Search for Student</h2>

          <div className="flex gap-4 mb-1">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              className="border px-4 py-3 w-full rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchStudent}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {!loading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
                </svg>
              )}
              {loading ? 'Loading...' : 'Search'}
            </button>
              
          </div>
          <div className="mb-6 w-full flex justify-center">
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {student && (
            <>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center">
                Subjects for {student.fname} {student.lname} - {student.studentType}
              </h3>
<h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center">
                Course: {student.course} - Year Level: {student.yearLevel} - Semester: {student.semester}
              </h3>

              <ul className="mb-6 space-y-4">
                {student.subjects.map((subject) => (
                  <li
                    key={subject._id}
                    className="border p-4 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md transition-transform hover:scale-105"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="text-gray-800 dark:text-gray-100">
                        <p>
                          <strong>{subject.code}</strong> - {subject.description} (units {subject.units})
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setConfirmDelete({ open: true, code: subject.code })}
                          className="text-red-600 hover:text-red-700 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add New Subject Form */}
              <div className="border-t pt-4 mt-6 dark:border-gray-700">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Add New Subject</h3>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-gray-700 dark:text-white">
                    Select Curriculum Subject
                  </label>
                  <select
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                    >
                      <option value="">-- Choose a course --</option>
                      <option value="BSCS">BS Computer Science</option>
                      <option value="BSHM">BS Hospitality Management</option>
                      <option value="BSBA">BS Business Administration</option>
                      <option value="BSTM">BS Tourism Management</option>
                      <option value="BEED">Bachelor of Elementary Education</option>
                      <option value="BSED-MATH">
                        Bachelor of Secondary Education - Math
                      </option>
                      <option value="BSED-ENG">
                        Bachelor of Secondary Education - English
                      </option>
                      <option value="BA-POLSCI">Bachelor of Arts - Political Science</option>
                      
                    </select>

                    <select
                      value={form.yearLevel}
                      onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
                    >
                      <option value="">-- Choose a Year Level --</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>

                    <select
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    >
                      <option value="">-- Choose a Semester --</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </select>
                  <select
                    value={newSubject.code}
                    onChange={(e) => {
                      const selected = curriculumSubjects.find(
                        (subj) => subj.code === e.target.value
                      );
                      if (selected) {
                        setNewSubject({
                          code: selected.code,
                          description: selected.description,
                          units: selected.units,
                        });
                      } else {
                        setNewSubject({ code: '', description: '', units: '' });
                      }
                    }}
                    className="border rounded px-4 py-2 w-full dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">-- Choose a subject --</option>
                    {curriculumSubjects.map((subject) => (
                      <option key={subject.code} value={subject.code}>
                        {subject.code} - {subject.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show the description and units in readonly inputs for clarity */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newSubject.description}
                    readOnly
                    placeholder="Description"
                    className="border rounded px-4 py-2 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="number"
                    value={newSubject.units}
                    readOnly
                    placeholder="Units"
                    className="border rounded px-4 py-2 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={addSubject}
                  className="bg-green-600 hover:bg-green-700 text-white mt-4 px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 w-full"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Subject'}
                </button>
              </div>

              {confirmDelete.open && (
                <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                      Are you sure you want to delete subject <b>{confirmDelete.code}</b>?
                    </h2>
                    <div className="flex justify-center gap-6">
                      <button
                        onClick={() => deleteSubject(confirmDelete.code)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ open: false, code: '' })}
                        className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-400 transition-transform hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </Login>
);
}