import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Login from '@/pages/Login';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/Loading';

const courseDescriptions = {
  "BSCS": "Bachelor of Science in Computer Science",
  "BSHM": "Bachelor of Science in Hospitality Management",
  "BSBA": "Bachelor of Science in Business Administration",
  "BEED": "Bachelor of Elementary Education",
  "BSED-ENG": "Bachelor of Secondary Education in English",
  "BSED-MATH": "Bachelor of Secondary Education in Mathematics",
  "BA-POLSCI": "Bachelor of Arts in Political Science",
  "BSTM": "Bachelor of Science in Tourism Management",
};
const year = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
}

export default function ManageCurriculum() {
  const [curricula, setCurricula] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, subjectId: '', curriculumId: '', code: '' });

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      toast.error('You do not have permission to access this page.');
      return;
    }

    const fetchCurricula = async () => {
      setError(null);
      try {
        const res = await axios.get('/api/subject-mappings?getAllCourseStructure=true');
        if (res.data.error) {
          toast.error(res.data.error);  
          setError(res.data.error);
        } else {
          setCurricula(res.data.data); // Updated to match the structured response
        }
      } catch (error) {
        console.error('Error fetching curricula:', error);
        setError(error.response?.data?.error || 'Failed to fetch curricula.');
      } finally {
        setLoading(false);
      }
    };
    fetchCurricula();
  }, [session]);

  const handleDeleteSubject = async () => {
  const { subjectId, curriculumId } = confirmDelete;
  console.log('Deleting subject:', subjectId, curriculumId);

  try {
    await axios.delete(`/api/subject-mappings?subjectId=${subjectId}&curriculumId=${curriculumId}`);
    toast.success('Subject deleted successfully');

    // Re-fetch the updated curricula after successful deletion
    const refetchRes = await axios.get('/api/subject-mappings?getAllCourseStructure=true');
      if (refetchRes.data.error) {
        toast.error(refetchRes.data.error);
        setError(refetchRes.data.error); // Save the error message from refetch
      } else {
        setCurricula(refetchRes.data.data); // Update state with the latest data
      }


    setConfirmDelete({ open: false, subjectId: '', curriculumId: '', code: '' });
  } catch (error) {
    const backendError = error.response?.data?.error || 'Failed to delete subject. Please try again.';
      toast.error(backendError);  // Show backend error message
      setError(backendError);
  }
};

  return (
    <Login>
      <Toaster position="top-right" />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl pt-5 font-bold mb-6 text-gray-900 dark:text-white text-center">Curriculum Guide</h2>

            <div className="flex justify-end mb-6">
              <Link href={'/manage-subjects'}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Manage Subjects
                </button>
              </Link>
            </div>

            {error && <div className="text-center text-red-600">{error}</div>}

            <div className="space-y-4">
              {curricula.map((courseData) => (
                <div key={courseData.course} className="bg-gray-100 hover:bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">{courseData.course} - {courseDescriptions[courseData.course]}</h3>
                  {courseData.yearLevels.map((yearData) => (
                    <div key={yearData.yearLevel} className="ml-4 mb-3">
                      <h4 className="text-lg font-semibold">Year Level: {year[yearData.yearLevel]}</h4>
                      {yearData.semesters.map((semesterData) => (
                        <div key={semesterData.semester} className="ml-6 mb-2">
                          <h5 className="text-md font-medium">{semesterData.semester} <div className="float-right mx-2">Actions</div></h5>
                          <ul className="ml-4 list-disc">
                            {semesterData.subjects.map((subject) => (
                              <li key={subject.code} className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 border-b border-t dark:border-t-gray-600 dark:border-b-gray-600 dark:hover:bg-gray-600 py-1 hover:bg-gray-200 flex items-center justify-between">
                                {subject.code} - {subject.description} ({subject.units} units)
                                <button
                                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                  onClick={() => setConfirmDelete({ open: true, subjectId: subject._id, curriculumId: courseData.course, code: subject.code })}
                                >
                                  Delete
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {confirmDelete.open && (
            <div className="fixed inset-0 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md w-1/3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">Are you sure you want to delete this subject <span className="text-red-500">{confirmDelete.code}?</span></h3>
                <div className="flex justify-center">
                  <div className="flex space-x-4">
                  <button
                    className="bg-red-500 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={handleDeleteSubject}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 ml-2 border border-gray-700 dark:border-gray-500 rounded hover:bg-gray-700"
                    onClick={() => setConfirmDelete({ open: false, subjectId: '', curriculumId: '' , code: '' })}
                  >
                    Cancel
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Login>
  );
}
