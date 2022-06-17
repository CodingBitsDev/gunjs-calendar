import { useEffect, useState } from "react";
import { DayPicker } from 'react-day-picker';
import { useForm } from "react-hook-form";
import useGunValue from "../../gun/hooks/useGunValue";
import DaySelect from "../DaySelect/DaySelect";
import Select from 'react-select'
import { useDispatch, useSelector } from "react-redux";
import useOverlay from "../../hooks/useOverlay";
import { IoAddCircle, IoCalendarNumber, IoToggle } from "react-icons/io5";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { MdDelete } from "react-icons/md";
import { createCalendar, removeCalendar, setActiveCalendars } from "../../redux/reducer/gunData";
import YesNoModal from "./YesNoModal";
import AddCalendarOverlay from "./AddCalendarOverlay";

function CalendarSelect({}){
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  let [overlay, setOverlay] = useOverlay();
  let activeCalendars = useSelector((state) => state?.gunData?.activeCalendars)
  let calendars = useSelector(state => state.gunData.calendars)
  let dispatch = useDispatch();
  
  let [ calendarList, setCalendarList ] = useState([])

  useEffect(() => {
    let list = Object.entries(calendars || {}).map(([ calendarId, calendar ], index) => {
      return { 
        id: calendarId,
        name: calendar.name || `Unknown${index}`,
        active: activeCalendars.includes(calendarId)
      }
    })
    setCalendarList(list)
  },[calendars, activeCalendars])


  const onDone  = () => {
    let newActiveCalendars = calendarList.map(c => c.active ? c.id : null).filter(Boolean);
    let actvieDiffers = newActiveCalendars.length != activeCalendars.length || newActiveCalendars.some(id => !activeCalendars.includes(id))
    if(actvieDiffers) dispatch(setActiveCalendars({activeCalendars: newActiveCalendars}))
    setOverlay(null)
  }

  let toogleCalendar=((calendarId, active) => {
    let index = calendarList.findIndex((c) => c.id == calendarId)
    let newList = [...calendarList]
    newList[index] = {...newList[index], active: !active}
    setCalendarList(newList)
  })

  let addCalendarPressed=() => {
    setOverlay(
    <AddCalendarOverlay
      onSave={(name) => {
        dispatch(createCalendar({name}))
        setOverlay(<CalendarSelect/>)
      }}
      onCancle={() => {
        setOverlay(<CalendarSelect/>)
      }}
    />)
  }

  let onRemove = (calendarId, name) => {
    setOverlay(<YesNoModal 
      title="Remove Calendar"
      text={`Are you sure you want to remove calendar ${name}. This cannot be undone`}
      onYes={() => {
        dispatch(removeCalendar({calendarId}))
        setOverlay(<CalendarSelect />)}}
      onNo={() => {setOverlay(<CalendarSelect />)}}

    />)
  }

  return (
    <form onSubmit={handleSubmit(onDone)} className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold mb-1">{`Active Calendars`}</h1>
        <IoAddCircle onClick={addCalendarPressed} className="text-green-500 ml-4 h-6 w-6 cursor-pointer"/>
      </div>
      <div className="w-full border-b-2 h-0 mb-2 "></div>
      <div
        className="w-full"
      >
        {calendarList.map((calendar , index) => {
          return (
            <div 
              onClick={() => toogleCalendar(calendar.id, calendar.active)}
              className={`flex w-full font-bold items-center justify-start p-2 hover:bg-slate-500
                ${index % 2 ? "bg-gray-300 hover:text-white " : "text-white py-3"}`
              }
            >
              <p>{calendar.name}</p>
              <div className="flex-grow"/>
              {
                calendar.active ? (
                  <ImCheckboxChecked />
                ) : (
                  <ImCheckboxUnchecked />
                )
              }
              <MdDelete onClick={() => onRemove(calendar.id, calendar.name)} className={`ml-4 w-8 h-8 text-red-600`}/>
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex flex-col">
        <button 
          className="bg-blue-600 font-bold text-white rounded-md grow"
        >
          Done
        </button>
      </div>
    </form>
  );
  return null;
}

export default CalendarSelect