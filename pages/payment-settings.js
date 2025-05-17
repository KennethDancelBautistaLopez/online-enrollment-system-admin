import { useEffect, useState } from "react";
import Login from "./Login";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";

export default function PaymentSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    if (!["superAdmin"].includes(session.user.role)) {
      router.push("/");
    }

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/payment-settings");
        setSettings(res.data.paymentSettings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session, router]);

  return (
    <Login>
      <div className="container mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8">
          {/* Header with title and Add New button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Payment Settings
            </h1>
            {/* <Link
              href="/payment-settings/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <PlusCircleIcon className="w-6 h-6" />
              Add New
            </Link> */}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg">
              Loading...
            </div>
          ) : settings.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg">
              No payment settings found.
            </div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {settings.map((data) => (
                <div
                  key={data._id}
                  className="flex flex-col justify-between rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.03]"
                >
                  <div className="flex items-center mb-4">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-500 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {data.examPeriod}
                    </h2>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                    Amount: <span className="font-bold">₱{data.amount}</span>
                  </p>

                  <Link
                    href={`/payment-settings/edit/${data._id}`}
                    className="self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Login>
  );
}
