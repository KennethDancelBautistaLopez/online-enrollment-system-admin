import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Login from './Login';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  const [confirmDelete, setConfirmDelete] = useState({ open: false, code: '' });
  const [form, setForm] = useState({
    course: '',
    yearLevel: '',
    semester: '',
    subjects: [{ code: '', description: '', units: '' }],
  }); 
  const { data: session } = useSession(); 

  if (!session || session.user.role !== 'superAdmin' && session.user.role !== 'admin') {
    toast.error('You do not have permission to access this page.');
    return <Login />;
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
      await axios.post('/api/subject-mappings', {
      code: `${course}-${yearLevel}-${semester}`, // Or any unique identifier
      description: `${course} Year ${yearLevel} ${semester}`,
      course,
      yearLevel,
      semester,
      subjects: subjects.map((s) => ({ ...s, units: parseInt(s.units) })),
    });
      toast.success('Curriculum saved successfully!');
      setForm({
        course: '',
        yearLevel: '',
        semester: '',
        subjects: [{ code: '', description: '', units: '' }],
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };
  const fetchStudent = async () => {
    if (!studentId) {
      toast.error('Student ID cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/subjects?id=${studentId}`);
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setStudent(res.data);
      }
    } catch {
      toast.error('Error fetching student data');
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
    } catch {
      toast.error('Error adding subject');
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
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl transition-transform transform hover:scale-105">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left side - Create Subject */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-6 flex justify-between pt-4">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white text-center">Add Curriculum</h2>
          <div>
            <Link href="/subjects/view-curriculum" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Curriculum</Link>
          </div>
          </div>
          <div className="grid gap-6 mb-6">
            <div className="flex gap-6">
              <select
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value.toUpperCase() })}
                className="border px-4 py-3 w-full rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="border px-4 py-3 w-full rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Semester (e.g., 1st)"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {form.subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-4">
              <input
                type="text"
                placeholder="Code"
                value={subject.code}
                onChange={(e) => handleSubjectChange(index, 'code', e.target.value)}
                className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={subject.description}
                onChange={(e) => handleSubjectChange(index, 'description', e.target.value)}
                className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Units"
                value={subject.units}
                onChange={(e) => handleSubjectChange(index, 'units', e.target.value)}
                className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.subjects.length > 1 && (
                <button
                  onClick={() => removeSubjectField(index)}
                  className="text-red-600 hover:text-red-700 text-sm mt-2 md:col-span-3"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addSubjectField}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm transition-transform hover:scale-105 w-full mt-4"
          >
            Add Another Subject
          </button>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 w-full"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Save Curriculum'}
          </button>
        </div>

        {/* Right side - Search for Student */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">Search for Student</h2>

          <div className="flex gap-4 mb-6">
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

          {student && (
            <>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center">
                Subjects for {student.fname} {student.lname}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Code"
                    className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Units"
                    className="border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSubject.units}
                    onChange={(e) => setNewSubject({ ...newSubject, units: e.target.value })}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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