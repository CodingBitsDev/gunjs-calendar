import { useEffect, useState } from "react";
import { DayPicker } from 'react-day-picker';
import { useForm } from "react-hook-form";
import useGunValue from "../../gun/hooks/useGunValue";
import DaySelect from "../DaySelect/DaySelect";

function AddDateOverlay({ startDate, endDate, name, onSave, onCancle, onDelete, isEdit, calendars, dateId, calendarId}){
  let [start, setStart] = useState(new Date(startDate))
  let [end, setEnd] = useState(new Date(endDate || Date.now()))
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  let [selectedCalendar, setSelectedCalendar] = useState(null)

  let calendarList = Object.entries(calendars || {}).map(([ calendarId, calendar ]) => {
    return [calendarId, calendar?.name || "Unknwon"]
  })

  useEffect(() => {
    let calendarList = Object.entries(calendars || {}).map(([ calendarId, calendar ]) => {
      return [calendarId, calendar?.name || "Unknwon"]
    })
    if(!calendarList.length) return
    if(!selectedCalendar) setSelectedCalendar(calendarList[0][0])
  },[calendars])

  useEffect(() => {
    setStart(new Date(startDate))
    setEnd(new Date(endDate))
    setValue("name", name)
  },[startDate, endDate, name])



  const onSubmit = (data) => {
    let startDate = new Date(start)
    let endDate = new Date(end)

    onSave?.(startDate.getTime(), endDate.getTime(), data.name, selectedCalendar)
  }

  const cancle = () => {
    onCancle()
  }

  const deletePressed  = () => {
    onDelete?.(calendarId, dateId);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <h1 className="text-white text-2xl font-bold mb-1">{isEdit ? "Edit Date" : "Select Date"}</h1>
      <div className="w-full border-b-2 h-0 mb-2 "></div>
      <label className="text-white font-bold mb-2">Name</label>
      <input required className="mb-5 px-2 rounded-md outline-none" placeholder="Name" defaultValue={name || ""} type={"text"} {...register("name")}/>
      <DaySelect 
        className={`mb-4 -mt-2`}
        title={"Start"}
        defaultValue={start}
        onSetDay={setStart}
      />
      {<DaySelect title={"End"} defaultValue={end} onSetDay={setEnd}/>}
      <div className="mt-6 flex">
        { isEdit && (
          <button onClick={deletePressed} className="bg-red-700 text-white rounded-md grow mr-4" > Remove </button>
        )}
        <button 
          className="bg-yellow-700 text-white rounded-md grow mr-4"
          onClick={cancle}
        >
          Cancle
        </button>
        <button 
          style={{ backgroundColor: "#5350ff" }}
          className="rounded-md grow text-white"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
  return null;
}

export default AddDateOverlay