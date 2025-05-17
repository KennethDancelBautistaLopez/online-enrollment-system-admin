// /pages/students/archive.js
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Login from "../Login"; // adjust relative path if Login is elsewhere
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function ArchivePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [err, setErr] = useState(null);

  /* --------------- role‑gate --------------- */
  useEffect(() => {
    if (!session) return;
    if (!["superAdmin"].includes(session.user.role)) router.push("/");
  }, [session, router]);

  /* --------------- fetch both archives --------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studRes, secRes] = await Promise.all([
          axios.get("/api/archive-students"),
          axios.get("/api/archive-sections"),
        ]);
        setStudents(studRes.data);
        setSections(secRes.data);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Error fetching archive");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* --------------- helpers --------------- */
  const fmtDate = (d) => new Date(d).toLocaleString();

  /* --------------- view --------------- */
  return (
    <Login>
      <div className="p-6 max-w-7xl mx-auto dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Archive Logs</h1>
          <Link href="/audit">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
              &larr; Back to Audit
            </button>
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : (
          <>
            {/* ---------- Archived Students ---------- */}
            <h2 className="text-xl font-semibold mt-8 mb-3 dark:text-white">
              Archived Students ({students.length})
            </h2>
            {students.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Course</th>
                      <th className="p-2">Year</th>
                      <th className="p-2">Semester</th>
                      <th className="p-2">SY</th>
                      <th className="p-2">Deleted&nbsp;At</th>
                      <th className="p-2">Deleted&nbsp;By</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s._id} className="border-t dark:border-gray-700">
                        <td className="p-2">
                          {s.fname} {s.lname}
                        </td>
                        <td className="p-2">{s.course}</td>
                        <td className="p-2 text-center">{s.yearLevel}</td>
                        <td className="p-2 text-center">{s.semester}</td>
                        <td className="p-2 text-center">{s.schoolYear}</td>
                        <td className="p-2 text-center">
                          {fmtDate(s.deletedAt)}
                        </td>
                        <td className="p-2 text-center">{s.DeletedBy}</td>
                        <button
                          onClick={async () => {
                            await axios.patch(
                              `/api/archive-students?id=${s._id}`
                            );
                            setStudents((prev) =>
                              prev.filter((item) => item._id !== s._id)
                            ); // remove from UI
                          }}
                          className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          Restore
                        </button>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No archived students.</p>
            )}

            {/* ---------- Archived Sections ---------- */}
            <h2 className="text-xl font-semibold mt-10 mb-3 dark:text-white">
              Archived Sections ({sections.length})
            </h2>
            {sections.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left">Section ID</th>
                      <th className="p-2 text-left">Course</th>
                      <th className="p-2">Year</th>
                      <th className="p-2">Semester</th>
                      <th className="p-2">SY</th>
                      <th className="p-2">Deleted&nbsp;At</th>
                      <th className="p-2">Deleted&nbsp;By</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((sec) => (
                      <tr
                        key={sec._id}
                        className="border-t dark:border-gray-700"
                      >
                        <td className="p-2">{sec.sectionID}</td>
                        <td className="p-2">{sec.course}</td>
                        <td className="p-2 text-center">{sec.yearLevel}</td>
                        <td className="p-2 text-center">{sec.semester}</td>
                        <td className="p-2 text-center">{sec.schoolYear}</td>
                        <td className="p-2 text-center">
                          {fmtDate(sec.deletedAt)}
                        </td>
                        <td className="p-2 text-center">{sec.deletedBy}</td>
                        <button
                          onClick={async () => {
                            await axios.patch(
                              `/api/archive-sections?id=${sec._id}`
                            );
                            setSections((prev) =>
                              prev.filter((item) => item._id !== sec._id)
                            );
                          }}
                          className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          Restore
                        </button>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No archived sections.</p>
            )}
          </>
        )}
      </div>
    </Login>
  );
}
