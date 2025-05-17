import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Login from "@/pages/Login"; // Wrapper layout
import LoadingSpinner from "@/components/Loading";
import SectionForm from "@/components/SectionForm"; // You should create this component

export default function EditSectionPage() {
  const router = useRouter();
  const [sectionId, setSectionId] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get section ID from dynamic route
  useEffect(() => {
    if (router.isReady && router.query.id) {
      const queryId = Array.isArray(router.query.id)
        ? router.query.id[0]
        : router.query.id;

      setSectionId(queryId);
    }
  }, [router.isReady, router.query]);

  // Fetch section data
  useEffect(() => {
    if (!sectionId) return;

    axios.get("/api/sections")
      .then((res) => {
        const section = res.data.data.find(sec => sec._id === sectionId);
        console.log(" section:", section);
        if (!section) {
          toast.error("Section not found ❌");
          return;
        }
        setSectionData(section);
        toast.success("Section loaded successfully ✅");
      })
      .catch((err) => {
        console.error("Error loading section:", err);
        toast.error("Failed to load section 🚨");
        setError("Failed to fetch section data.");
      })
      .finally(() => setLoading(false));
  }, [sectionId]);

  return (
    <Login>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 dark:text-white text-gray-700">Edit Section</h1>
          {error && <p className="text-red-500">{error}</p>}
          {sectionData ? (
            <SectionForm sectionData={sectionData} />
          ) : (
            <p>No section data found.</p>
          )}
        </>
      )}
    </Login>
  );
}
