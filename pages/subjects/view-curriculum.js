import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Login from '@/pages/Login';
import Link from 'next/link';
import {useSession} from 'next-auth/react';

export default function ManageCurriculum() {
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
//   const [confirmDelete, setConfirmDelete] = useState({ open: false, curriculumId: '' });

  const { data: session } = useSession();



  // Fetch all curricula on component mount
  useEffect(() => {

      if (!session || session.user.role !== 'superAdmin' && session.user.role !== 'admin') {
    toast.error('You do not have permission to access this page.');
  }
    const fetchCurricula = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/subject-mappings');
        if (res.data.error) {
          toast.error(res.data.error);
        } else {
          setCurricula(res.data.data); // Assuming the data is in res.data.data
        }
      } catch (error) {
        toast.error('Error fetching curricula');
      } finally {
        setLoading(false);
      }
    };
    fetchCurricula();
  }, [ session ]);

  const handleDelete = async (curriculumId) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this curriculum?');
  if (!confirmDelete) return;

  try {
    await axios.delete('/api/subject-mappings', {
      data: { curriculumId }, // send ID in body
    });

    // Refresh the curriculum list after deletion
    fetchCurriculums();
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    alert('Failed to delete curriculum. Please try again.');
  }
};

  return (
    <Login>
      <Toaster position="top-right" />
      <div className="p-8 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl transition-transform transform hover:scale-105">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">Curriculum List</h2>

            <div>
                <Link href={'/manage-subjects'}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Manage Subjects
                    </button>
                </Link>
            </div>

            {error && <div className="text-center text-red-600">{error}</div>}

            {loading && <div className="text-center text-gray-600">Loading...</div>}

            {!loading && curricula.length === 0 && (
              <div className="text-center text-gray-600">No curricula found.</div>
            )}

            <ul className="mb-6 space-y-4">
              {curricula.map((curriculum) => (
                <li
                  key={curriculum._id}
                  className="border p-4 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md transition-transform hover:scale-105"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="text-gray-800 dark:text-gray-100">
                      <p>
                        <strong>{curriculum.course}</strong> - Year {curriculum.yearLevel} {curriculum.semester} 
                      </p>
                      <p>Code: {curriculum.code}</p>
                      <p>Description: {curriculum.description}</p>
                      <p>Units: {curriculum.units}</p>

                    </div>
                    {/* <div className="flex gap-4">
                      <button
                        onClick={() => setConfirmDelete({ open: true, curriculumId: curriculum._id })}
                        className="text-red-600 hover:text-red-700 transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div> */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Are you sure you want to delete the curriculum for{' '}
              <b>{confirmDelete.curriculumId}</b>?
            </h2>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleDelete(confirmDelete.curriculumId)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-transform hover:scale-105"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete({ open: false, curriculumId: '' })}
                className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-400 transition-transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </Login>
  );
}
