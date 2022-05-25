import { useEffect, useState } from "react";
import { DayPicker } from 'react-day-picker';
import { useForm } from "react-hook-form";
import DaySelect from "../DaySelect/DaySelect";

function AddDateOverlay({ startDate, endDate, who}){
  let [start, setStart] = useState(new Date(startDate || Date.now()))
  let [end, setEnd] = useState(new Date(endDate || Date.now()))
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    setValue("start", start.toUTCString())
  })

  const setStartVal = (val, val2) => {
    console.log("### val", val, val2)
    setValue("start", val.toUTCString)
    setStart(val)
  }

  console.log("###", start, end, startDate, endDate)

  return (
    <form className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <DaySelect 
        className={`mb-4 -mt-2`}
        title={"Start"}
        startDate={start}
        onSetDay={setStart}
      />
      {<DaySelect title={"End"} startDate={end} onSetDay={setEnd}/>}
      <button 
        className="bg-blue-700"
        stype="submit"
      >
        Save
      </button>
    </form>
  );
  return null;
}

export default AddDateOverlay