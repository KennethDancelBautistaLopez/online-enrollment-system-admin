import Login from "@/pages/Login";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";

export default function DeleteEventPage() {
  const router = useRouter();
  const [eventInfo,setEventInfo] = useState();
  const {id} = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/api/events?id='+id).then(response => {
      setEventInfo(response.data);
    });
  }, [id]);
  function goBack() {
    router.push('/events');
  }
  async function deleteEvent() {
    await axios.delete('/api/events?id='+id);
    goBack();
  }
  return (
       <Login>
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
           <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
             <h1 className="text-lg font-semibold mb-4">
               Do you really want to delete &quot;{eventInfo?.name}&quot;?
             </h1>
             <div className="flex justify-center gap-4">
               <button onClick={deleteEvent} className="bg-red-500 text-white px-4 py-2 rounded">
                 Yes
               </button>
               <button onClick={goBack} className="bg-gray-300 px-4 py-2 rounded">
                 No
               </button>
             </div>
           </div>
         </div>
       </Login>
  );
}