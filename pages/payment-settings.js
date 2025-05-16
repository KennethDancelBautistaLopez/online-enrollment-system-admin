import { useEffect, useState } from "react";
import Login from "./Login";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";

export default function PaymentSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState();
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
      <div className="container mx-auto p-4">
        <div className="w-full flex flex-col gap-3 md:flex-row border p-4 md:p-6 rounded-xl shadow-xl overflow-y-auto max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
          {loading ? (
            <div>Loading...</div>
          ) : (
            settings?.map((data) => (
              <div
                key={data._id}
                className="p-3 w-full text-center rounded-lg dark:bg-gray-600 dark:border-gray-500"
              >
                <div>{data.examPeriod}</div>
                <div>{data.amount}</div>
                <Link href={`/payment-settings/edit/${data._id}`}>
                  <div>Edit</div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </Login>
  );
}
