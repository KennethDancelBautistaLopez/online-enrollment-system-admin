import Login from "@/pages/Login";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';
import LoadingSpinner from "@/components/Loading";


export default function DeleteEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eventInfo,setEventInfo] = useState();
  const {id} = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/api/events?id='+id).then(response => {
      setEventInfo(response.data);
    })
    .catch(error => {
      console.error('Error fetching event:', error);
      toast.error("Failed to fetch event data. Please try again. 🚨");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [id]);
  function goBack() {
    router.push('/events');
  }
  async function deleteEvent() {
    try {
    await axios.delete('/api/events?id='+id);
    toast.success("Event deleted successfully! 🎉");
    goBack();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("Failed to delete event. Please try again. ❌");
    } 
  }
  return (
    <Login>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
            <h1 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Do you really want to delete <b>{eventInfo?.title}</b>?
            </h1>
            <div className="flex justify-center gap-4">
              <button onClick={deleteEvent} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Yes
              </button>
              <button onClick={goBack} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400">
                No
              </button>
            </div>
          </div>
          </>
          )}
      </div>
    </Login>
  );
}