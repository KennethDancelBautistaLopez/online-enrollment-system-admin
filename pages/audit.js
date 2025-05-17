import { useEffect, useState } from "react";
import Login from "./Login";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

function DiffTable({ differences, action, before, after }) {
  if (action === "create" || action === "archive") {
    return (
      <div>
        <p>
          <strong>Document created.</strong>
        </p>
        <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded">
          {JSON.stringify(after, null, 2)}
        </pre>
      </div>
    );
  }

  if (!differences || differences.length === 0) {
    return (
      <p className="text-sm italic text-gray-500 dark:text-gray-400">
        No differences
      </p>
    );
  }

  // Helper to stringify values (handle objects gracefully)
  const stringify = (val) => {
    if (val === undefined) return "<undefined>";
    if (val === null) return "<null>";
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return val.toString();
  };

  return (
    <table className="min-w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded-md">
      <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
            Path
          </th>
          <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
            Change Type
          </th>
          <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
            Before
          </th>
          <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
            After
          </th>
        </tr>
      </thead>
      <tbody>
        {differences.map((diff, i) => {
          const path = diff.path ? diff.path.join(".") : "";
          let beforeValue = "";
          let afterValue = "";

          switch (diff.kind) {
            case "N": // new
              beforeValue = "-";
              afterValue = stringify(diff.rhs);
              break;
            case "D": // deleted
              beforeValue = stringify(diff.lhs);
              afterValue = "-";
              break;
            case "E": // edited
              beforeValue = stringify(diff.lhs);
              afterValue = stringify(diff.rhs);
              break;
            case "A": // array
              beforeValue = stringify(diff.item.lhs);
              afterValue = stringify(diff.item.rhs);
              break;
            default:
              beforeValue = "-";
              afterValue = "-";
          }

          return (
            <tr
              key={i}
              className="border-t border-gray-200 dark:border-gray-600"
            >
              <td className="px-3 py-2 align-top">{path}</td>
              <td className="px-3 py-2 align-top capitalize">{diff.kind}</td>
              <td className="px-3 py-2 font-mono whitespace-pre-wrap">
                {beforeValue}
              </td>
              <td className="px-3 py-2 font-mono whitespace-pre-wrap">
                {afterValue}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Page() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    if (!["superAdmin"].includes(session.user.role)) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/audit", {
          params: collectionName ? { collectionName } : {},
        });
        setLogs(response.data.auditLogs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [collectionName]);

  return (
    <Login>
      <div className="p-6 max-w-6xl mx-auto dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Audit Logs
          </h1>
          <Link href="/students/archive" className="mb-6">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
              Archive Logs
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <select
            type="text"
            placeholder="Filter by collection name..."
            className="border border-gray-300 rounded px-3 mb-0 py-2 w-64 dark:text-white dark:bg-gray-800 dark:border-gray-700"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          >
            <option value={""}>Filter by</option>
            <option value={"Student"}>Student</option>
            <option value={"Section"}>Section</option>
            <option value={"Curriculum"}>Curriculum</option>
            <option value={"PaymentSettings"}>Payment Settings</option>
            <option value={"ArchiveStudent"}>Archive Students</option>
            <option value={"ArchiveSection"}>Archive Section</option>
          </select>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => setCollectionName("")}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No audit logs found.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log._id}
                className="border border-gray-300 rounded p-4 bg-white shadow-sm dark:text-white dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex justify-between">
                  <div>
                    <p>
                      <strong>Action:</strong> {log.action}
                    </p>
                    <p>
                      <strong>User:</strong> {log.user.email}
                    </p>
                    <p>
                      <strong>Collection:</strong> {log.collectionName}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="text-sm self-start p-1 md:p-3 rounded-3xl bg-white text-black dark:bg-gray-700 dark:text-white border"
                    onClick={() =>
                      setExpandedLogId((prev) =>
                        prev === log._id ? null : log._id
                      )
                    }
                  >
                    {expandedLogId === log._id ? "Hide Diff" : "Show Diff"}
                  </button>
                </div>

                {expandedLogId === log._id && (
                  <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto dark:text-white dark:bg-gray-800 dark:border-gray-700">
                    <DiffTable
                      differences={log.diff}
                      action={log.action}
                      before={log.before}
                      after={log.after}
                    />
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Login>
  );
}
