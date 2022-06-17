import { useEffect, useState } from "react";
import { DayPicker } from 'react-day-picker';
import { useForm } from "react-hook-form";
import useGunValue from "../../gun/hooks/useGunValue";
import DaySelect from "../DaySelect/DaySelect";
import Select from 'react-select'
import { useSelector } from "react-redux";

function AddDateOverlay({ startDate, endDate, name, onSave, onCancle, onDelete, isEdit, dateId, calendarId}){
  let [start, setStart] = useState(new Date(startDate))
  let [end, setEnd] = useState(new Date(endDate || Date.now()))
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  let [selectedCalendar, setSelectedCalendar] = useGunValue("_user/selectedCalendar")
  let calendars = useSelector(state => state.gunData.calendars)

  let activeCalendars = useSelector((state) => state?.gunData?.activeCalendars)

  let calendarList = Object.entries(calendars || {}).map(([ calendarId, calendar ], index) => {
    return { value: calendarId, label: calendar.name || `Unknown${index}`}
  }).filter((c => activeCalendars.includes(c.value)))

  useEffect(() => {setFocus("name")},[])
  useEffect(() => {
    let startDate = new Date(start)
    let endDate = new Date(end)
    if(startDate.getTime() > endDate.getTime()){
      setEnd(startDate.getTime() + 1000*60*60);
    }
  },[start, end])

  useEffect(() => {
    let calendarIds = Object.entries(calendars || {}).map(([ calendarId, calendar ]) => {
      return calendarId
    }).filter(id => activeCalendars.includes(id))
    if(!calendarIds.length) return
    if(!calendarIds.includes(selectedCalendar) && selectedCalendar != undefined) {
      setSelectedCalendar(calendarIds[0])
    }
  },[calendars, activeCalendars])


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

  const onCalendarChange = (data) => {
    setSelectedCalendar(data.value)
  }

  console.log(calendarList, calendarList.find(c => c.value == selectedCalendar), selectedCalendar)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <div className="flex">
        <h1 className="text-white text-2xl font-bold mb-1">{isEdit ? "Edit Date" : "Select Date"}</h1>
        <div className="flex-grow"/>
        {!isEdit ? (
          <Select onChange={onCalendarChange} value={calendarList.find(c => c.value == selectedCalendar)} className="h-6 mb-4 transform translate-x-4 scale-75" options={calendarList} />
        ) : (
          <h2 className="text-white">{calendars[calendarId]?.name}</h2>
        )}
      </div>
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
      <input className="hidden" type="submit" />
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
        >
          Save
        </button>
      </div>
    </form>
  );
  return null;
}

export default AddDateOverlay