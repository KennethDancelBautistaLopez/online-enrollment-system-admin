import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Login from './Login';

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
  
      <div className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Student Subjects</h1>
  
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter Student ID"
            className="border px-4 py-2 w-full rounded text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={fetchStudent}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
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
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Subjects for {student.fname} {student.lname}
            </h2>
  
            <ul className="mb-4 space-y-3">
              {student.subjects.map((subject) => (
                <li key={subject._id} className="border p-4 rounded bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div className="text-gray-800 dark:text-gray-100">
                      <p>
                        <strong>{subject.code}</strong> - {subject.description} (units {subject.units})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete({ open: true, code: subject.code })}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
  
            {confirmDelete.open && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Are you sure you want to delete subject <b>{confirmDelete.code}</b>?
                  </h2>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => deleteSubject(confirmDelete.code)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ open: false, code: '' })}
                      className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
  
            <div className="border-t pt-4 mt-4 dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Add New Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Code"
                  className="border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Units"
                  className="border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={newSubject.units}
                  onChange={(e) => setNewSubject({ ...newSubject, units: e.target.value })}
                />
              </div>
              <button
                onClick={addSubject}
                className="bg-green-600 hover:bg-green-700 text-white mt-3 px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Subject'}
              </button>
            </div>
          </>
        )}
      </div>
    </Login>
  );
}  