import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const SectionForm = ({ sectionData: initialData = null }) => {
  const router = useRouter();
  const isEditing = Boolean(initialData?._id);
  const [sectionID, setSectionID] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goToSections, setGoToSections] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setSectionID(initialData.sectionID || '');
    setCourse(initialData.course || '');
    setYearLevel(initialData.yearLevel || '');
    setSemester(initialData.semester || '');
    setSchoolYear(initialData.schoolYear || '');
    setSubjects(initialData.subjects || []);
  }, [initialData]);

  useEffect(() => {
    if (goToSections) router.push('/sections');
  }, [goToSections, router]);

  const updateProfessor = (idx, value) => {
    const arr = [...subjects];
    arr[idx] = { ...arr[idx], professor: value };
    setSubjects(arr);
  };

  const updateSchedule = (idx, day, value) => {
    const arr = [...subjects];
    const sched = { ...arr[idx].schedule, [day]: value };
    arr[idx] = { ...arr[idx], schedule: sched };
    setSubjects(arr);
  };

  const saveSection = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    const payload = { sectionID, course, yearLevel, semester, schoolYear, subjects };
    try {
      if (isEditing) {
        await axios.put('/api/sections', { id: initialData._id, updates: payload });
        toast.success('Section updated successfully!');
      } else {
        await axios.post('/api/sections', { ...payload, students: [] });
        toast.success('Section created successfully!');
      }
      setGoToSections(true);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} section.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={saveSection}
      className="w-full max-w-4xl mx-auto p-6 space-y-8 bg-white border rounded-xl shadow-2xl dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditing ? 'Edit Section' : 'Create Section'}
        </h2>
        <Link href="/sections" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Sections
        </Link>
      </div>

      {/* Section Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
        <h3 className="col-span-full text-lg font-semibold text-gray-700 dark:text-gray-200">Section Info</h3>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Section ID</label>
          <input
            type="text"
            value={sectionID}
            onChange={e => setSectionID(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Course</label>
          <select
            value={course}
            onChange={e => setCourse(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-600 dark:text-white"
            required
          >
            <option value="">Select course</option>
            {['BSCS', 'BSHM', 'BSBA', 'BSTM', 'BEED', 'BSED-ENG', 'BSED-MATH', 'BA-POLSCI'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Year Level</label>
          <select
            value={yearLevel}
            onChange={e => setYearLevel(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-600 dark:text-white"
            required
          >
            <option value="">Select year level</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Semester</label>
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-600 dark:text-white"
            required
          >
            <option value="">Select semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">School Year</label>
          <select
            value={schoolYear}
            onChange={e => setSchoolYear(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-600 dark:text-white"
            required
          >
            <option value="">Select school year</option>
            {['2024-2025', '2025-2026', '2026-2027', '2027-2028', '2028-2029'].map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects & Schedule */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Subjects & Schedule</h3>
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
          {subjects.map((subj, i) => (
            <div key={i} className="p-4 borde hover:bg-gray-50 dark:hover:bg-gray-800 border rounded-xl bg-gray-100 dark:bg-gray-700 dark:border-gray-600 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Code</label>
                  <input
                    type="text"
                    value={subj.code || ''}
                    readOnly
                    className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Description</label>
                  <input
                    type="text"
                    value={subj.description || ''}
                    readOnly
                    className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300">Professor</label>
                  <input
                    type="text"
                    value={subj.professor || ''}
                    onChange={e => updateProfessor(i, e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                  />
                </div>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                  <div key={day}>
                    <label className="block capitalize text-gray-700 dark:text-gray-300">{day}</label>
                    <select
                      value={subj.schedule?.[day] || ''}
                      onChange={e => updateSchedule(i, day, e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Select time</option>
                      <option>7:00AM - 8:00AM</option>
                      <option>8:00AM - 9:00AM</option>
                      <option>9:00AM - 10:00AM</option>
                      <option>10:00AM - 11:00AM</option>
                      <option>11:00AM - 12:00PM</option>
                      <option>1:00PM - 2:00PM</option>
                      <option>2:00PM - 3:00PM</option>
                      <option>3:00PM - 4:00PM</option>
                      <option>4:00PM - 5:00PM</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded-full font-medium text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition duration-200`}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Section' : 'Submit Section'}
        </button>
      </div>
    </form>
  );
};

export default SectionForm;





            //    <option value="7:00AM - 8:00AM">7:00AM - 8:00AM</option>
            //     <option value="8:00AM - 9:00AM">8:00AM - 9:00AM</option>
            //     <option value="9:00AM - 10:00AM">9:00AM - 10:00AM</option>
            //     <option value="10:00AM - 11:00AM">10:00AM - 11:00AM</option>
            //     <option value="11:00AM - 12:00PM">11:00AM - 12:00PM</option>
            //     <option value="12:00PM - 1:00PM">12:00PM - 1:00PM</option>
            //     <option value="1:00PM - 2:00PM">1:00PM - 2:00PM</option>
            //     <option value="2:00PM - 3:00PM">2:00PM - 3:00PM</option>
            //     <option value="3:00PM - 4:00PM">3:00PM - 4:00PM</option>
            //     <option value="4:00PM - 5:00PM">4:00PM - 5:00PM</option>
            //     <option value="5:00PM - 6:00PM">5:00PM - 6:00PM</option>
            //     <option value="6:00PM - 7:00PM">6:00PM - 7:00PM</option>
            //     <option value="7:00AM - 8:30AM">7:00AM - 8:30AM</option>
            //     <option value="8:30AM - 10:00AM">8:30AM - 10:00AM</option>
            //     <option value="10:00AM - 11:30AM">10:00AM - 11:30AM</option>
            //     <option value="11:30AM - 1:00PM">11:30AM - 1:00PM</option>
            //     <option value="1:00PM - 2:30PM">1:00PM - 2:30PM</option>
            //     <option value="2:30PM - 4:00PM">2:30PM - 4:00PM</option>