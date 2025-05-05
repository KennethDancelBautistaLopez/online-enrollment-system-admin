// pages/subjects.js
import { useState } from 'react';
import Login from './Login';

const semesters = [
  '1st Year - 1st Sem',
  '1st Year - 2nd Sem',
  '2nd Year - 1st Sem',
  '2nd Year - 2nd Sem',
  '3rd Year - 1st Sem',
  '3rd Year - 2nd Sem',
  '4th Year - 1st Sem',
  '4th Year - 2nd Sem',
];

export default function AddSubjectPage() {
  const [studentId, setStudentId] = useState('');
  const [semesterKey, setSemesterKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalSubjectCode, setOriginalSubjectCode] = useState('');
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectDescription: '',
    day: '',
    time: '',
    teacher: '',
    unit: '',
    mode: '',
    room: '',
    // grade: '',
  });

  const [subjects, setSubjects] = useState({});

  const initialEmptyFormData = {
    subjectCode: '',
    subjectDescription: '',
    day: '',
    time: '',
    teacher: '',
    unit: '',
    mode: '',
    room: '',
    // grade: '',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId || !semesterKey) {
      alert('Please enter student ID and select a semester.');
      return;
    }

    if (isEditing) {
      const res = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          semesterKey,
          subjectCode: originalSubjectCode,
          updatedSubject: formData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Subject updated successfully!');
        setIsEditing(false);
        setOriginalSubjectCode('');
        setFormData({ ...initialEmptyFormData });
        fetchSubjects();
      } else {
        alert(`Error: ${data.error}`);
      }
    }
  };

  const fetchSubjects = async () => {
    if (!studentId) {
      alert('Enter student ID to fetch subjects');
      return;
    }

    const res = await fetch(`/api/subjects?studentId=${studentId}`);
    const data = await res.json();

    if (res.ok) {
      setSubjects(data);
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  const handleDeleteSubject = async (semesterKey, subjectCode) => {
    const confirmDelete = confirm(`Delete subject ${subjectCode} from ${semesterKey}?`);
    if (!confirmDelete) return;

    const res = await fetch('/api/subjects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, semesterKey, subjectCode }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Subject deleted successfully');
      fetchSubjects();
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  const handleEditSubject = (semesterKey, subject) => {
    setSemesterKey(semesterKey);
    setFormData(subject);
    setIsEditing(true);
    setOriginalSubjectCode(subject.subjectCode);
  };

  return (
    <Login>
      <div className="flex flex-col md:flex-row p-8 gap-8 max-w-7xl mx-auto">
        <div className="md:w-1/2 w-full dark:bg-gray-800 bg-white shadow-lg p-8 rounded-lg border border-gray-200">
          <h1 className="text-2xl font-bold dark:text-white text-gray-700 mb-6">Add Subject</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />

            <select
              value={semesterKey}
              onChange={(e) => setSemesterKey(e.target.value)}
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>

            <input
              name="subjectCode"
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase().slice(0, 10) })}
              placeholder="Subject Code"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              name="subjectDescription"
              value={formData.subjectDescription}
              onChange={(e) => setFormData({
                ...formData,
                subjectDescription: e.target.value
                  .replace(/\b\w/g, (char) => char.toUpperCase())
                  .replace(/\s+/g, ' '),
              })}
              placeholder="Subject Description"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
  
            <select
            name="day"
            value={formData.day}
            onChange={(e) => setFormData({
              ...formData,
              day: e.target.value.toUpperCase().split('').join('-').slice(0, 5),
            })}
            className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select day(s)</option>
            <option value="M-W-F">M-W-F</option>
            <option value="T-Th">T-Th</option>
            <option value="M-F">M-F</option>
            <option value="M">M</option>
            <option value="T">T</option>
            <option value="W">W</option>
            <option value="Th">Th</option>
            <option value="F">F</option>
          </select>

  
            <select
            name="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select time</option>
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
            <option value="7:00AM - 8:30AM">7:00AM - 8:30AM</option>
            <option value="8:30AM - 10:00AM">8:30AM - 10:00AM</option>
            <option value="10:00AM - 11:30AM">10:00AM - 11:30AM</option>
            <option value="11:30AM - 1:00PM">11:30AM - 1:00PM</option>
            <option value="1:00PM - 2:30PM">1:00PM - 2:30PM</option>
            <option value="2:30PM - 4:00PM">2:30PM - 4:00PM</option>
          </select>
  
            <input
              name="teacher"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              placeholder="Teacher"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
  
            <input
              name="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value.slice(0, 2) })}
              placeholder="Unit"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
  
            <select
              name="mode"
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Mode</option>
              <option value="online">Online Class</option>
              <option value="face-to-face">Face-to-Face</option>
              <option value="mooc">MOOC</option>
            </select>
  
            <input
              name="room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Room"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
  
            {/* <input
              name="grade"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              placeholder="Grade (Optional)"
              className="w-full p-3 border dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white text-gray-700 rounded-md focus:outline-none dark:focus:ring-gray-600 focus:ring-2 focus:ring-blue-500"
            /> */}
            

            <div className="flex justify-between gap-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                  <path d="M200-200v-560 179-19 400Zm80-240h221q2-22 10-42t20-38H280v80Zm0 160h157q17-20 39-32.5t46-20.5q-4-6-7-13t-5-14H280v80Zm0-320h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v258q-14-26-34-46t-46-33v-179H200v560h202q-1 6-1.5 12t-.5 12v56H200Zm480-200q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-120v-56q0-24 12.5-44.5T528-250q36-15 74.5-22.5T680-280q39 0 77.5 7.5T832-250q23 9 35.5 29.5T880-176v56H480Z" />
                </svg>
                Submit
              </button>
              <button
                type="button"
                onClick={fetchSubjects}
                className="w-full bg-gray-600 hover:bg-gray-700 transition text-white py-3 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                  <path d="M480-400q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400ZM320-240h320v-23q0-24-13-44t-36-30q-26-11-53.5-17t-57.5-6q-30 0-57.5 6T369-337q-23 10-36 30t-13 44v23ZM720-80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80Zm0-80v-446L526-800H240v640h480Zm-480 0v-640 640Z" />
                </svg>
                Load Subjects
              </button>
            </div>
          </form> 
        </div>
        

        <div className="md:w-1/2 w-full dark:bg-gray-800 bg-gray-50 shadow-inner p-8 rounded-lg border border-gray-200 max-h-[85vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-700 text-start dark:text-white">Subjects</h2>
          {Object.keys(subjects).length === 0 ? (
            // eslint-disable-next-line react/no-unescaped-entities
            <p className="text-gray-500">No subjects loaded. Click "Load Subjects" to fetch subjects.</p>
          ) : (
            Object.entries(subjects).map(([semester, list]) => (
              <div key={semester} className="mb-6 border-b pb-4">
                <h3 className="text-lg font-bold dark:text-white text-g mb-2">{semester}</h3>
                <ul className="space-y-2">
                  {list.map((subj, index) => (
                    <li key={index} className="flex justify-between items-start text-gray-800 dark:text-white">
                      <div>
                        <span className="font-semibold">{subj.subjectCode}</span> — {subj.subjectDescription} ({subj.teacher})
                      </div>
                      <div className="flex gap-2 text-sm">
                        <button
                          onClick={() => handleEditSubject(semester, subj)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(semester, subj.subjectCode)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </Login>
  );
}