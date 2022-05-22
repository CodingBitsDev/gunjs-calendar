import { useState } from "react";
import DatePicker from "react-datepicker";

function AddDateOverlay({ startDate, endDate, who}){
  let [start, setStart] = useState(new Date(startDate || Date.now()))
  let [end, setEnd] = useState(new Date(endDate || Date.now()))

  console.log("###", start, end, startDate, endDate)

  return (
    <div className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <DatePicker selected={start} onChange={(date) => setStart(date)} />
      {/* <DatePicker selected={end} onChange={(date) => setEnd(date)} /> */}
    </div>
  );
  return null;
}

export default AddDateOverlay