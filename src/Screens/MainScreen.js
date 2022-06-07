import React, { useEffect, useState } from "react";
import WeekSelect from "../components/WeekSelect";
import Header from "../components/Header";
import CalendarWeek from "../components/CalendarWeek";
import useOverlay from "../hooks/useOverlay";
import AddDateOverlay from "../components/Overlays/AddDateOverlay";
import { useDispatch, useSelector } from "react-redux";
import { addDate, editDate, removeDate } from "../redux/reducer/gunData";

let week = [
  { date:"05.22.2022", hours : [{start: "05.22.2022 10:00", end: "05.22.2022 12:30", what: "Bjoern"}]},
  { date:"05.23.2022", hours : [{start: "05.23.2022 10:00", end: "05.23.2022 11:00", what: "Bjoern"}]},
  { date:"05.24.2022", hours : []},
  { date:"05.25.2022", hours : []},
  { date:"05.26.2022", hours : [{start: "05.26.2022 10:00", end: "05.26.2022 16:00", what: "Nils"}, {start: "05.26.2022 17:00", end: "05.26.2022 18:00", what: "Nils"}]},
  { date:"05.27.2022", hours : [{start: "05.27.2022 10:00", end: "05.27.2022 11:00", what: "Bjoern"}]},
  { date:"05.28.2022", hours : [{start: "05.28.2022 10:00", end: "05.28.2022 11:00", what: "Bjoern"}]},
]

const MainScreen = () => {
  let [overlay, setOverlay] = useOverlay();
  let dispatch = useDispatch()
  let initiated = useSelector((state) => state?.gunData?.initiated)
  let selectedWeek = useSelector((state) => state?.gunData?.currentWeek)
  let calendars = useSelector((state) => state?.gunData?.calendars)
  let activeCalendars = useSelector((state) => state?.gunData?.activeCalendars)

  let [ week, setWeek ] = useState([])
  useEffect(() => {
    if(!initiated) return;
    let newWeek = [];
    let endDate = selectedWeek + 8 * 1000 * 60 * 60 * 24 -1;
    
    let currentMonth = new Date(selectedWeek);
    currentMonth.setUTCDate(1);
    currentMonth.setUTCHours(0,0,0,0);
    let currentMonthKey = currentMonth.getTime();

    let nextMonth = new Date(currentMonthKey);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    let nextMonthKey = nextMonth.getTime();
    let includeNextMonth = endDate > nextMonthKey;

    let monthKeys = includeNextMonth ? [currentMonthKey, nextMonthKey] : [currentMonthKey];

    let dates = [];
    ( activeCalendars || [] ).forEach(id => {
      Object.entries( calendars?.[id]?.months || {} ).forEach(( [key, month] ) => {
        if(!monthKeys.includes(Number(key))) return;
        dates = [...(dates || []), ...month]
      })
    });

    for (let i = 0; i < 7; i++) {
      let day = selectedWeek + i * 1000 * 60 * 60 * 24;
      let nextDay = day + 1000 * 60 * 60 * 24;
      let hours = dates.filter(date => {
        return date.date.start > day && date.date.end <= nextDay;
      }).map((date) => ({
        start: date.date.start,
        end: date.date.end,
        what: date.name,
        calendarId: date.calendarId,
        id: date.id
      }))
      newWeek.push({date: day, hours}) 
      day = nextDay;
    }

    setWeek(newWeek)
  },[initiated, selectedWeek, calendars, activeCalendars])

  const clickFree = (date) => {
    console.log(date)
    let start = new Date(date)
    let end = new Date(date)
    end.setHours(end.getHours()+1)
    let onSave = (start, end, name, calendar) => {
      dispatch(addDate({
        calendarId: calendar,
        date: {start, end},
        name: name,
      })) 
      setOverlay(null)
    }
    let onCancle = () => {
      setOverlay(null)
    }
    setOverlay(<AddDateOverlay startDate={start} endDate={end} onSave={onSave} onCancle={onCancle} calendars={calendars}/>)
  }

  const clickHour = ( data ) => {
    let calendar = calendars[data.calendarId]
    let selectedDate = null;
    let month = Object.entries(calendar.months || {}).find(( [key, month] ) => {
      return ( month || [] ).some(date => {
        if(date.id == data.id) {
          selectedDate = date
          return true
        }
      })
    })
    if(!month) return;
    let monthId = month[0]
    console.log(data)
    let start = new Date(data.start);
    let end = new Date(data.end);
    let name = data.what;
    setOverlay()
    let onSave = (start, end, name, calendarId) => {
      let newDate = {...selectedDate, date: {start, end}, name: name};
      dispatch(editDate({monthId, date:newDate}))
      setOverlay(null)
      //TODO
    }
    let onCancle = () => {
      setOverlay(null)
    }
    let onDelete = () => {
      dispatch(removeDate({monthId, calendarId: selectedDate.calendarId, dateId: selectedDate.id}))

      setOverlay(null)
    }
    setOverlay(<AddDateOverlay name={name} startDate={start} endDate={end} onSave={onSave} onCancle={onCancle} onDelete={onDelete} isEdit/>)
  }

  if(!initiated) return null;
  
  return (
    <div className="flex flex-col w-screen h-screen bg-black">
      <Header 
        title={"Calendar"}
        rightElem={<WeekSelect/>}
      />
      <div className="w-full h-full">
        <CalendarWeek weekDays={week} onClickFree={clickFree} onClickHour={clickHour}/>
      </div>
    </div>
  )
}
export default MainScreen;