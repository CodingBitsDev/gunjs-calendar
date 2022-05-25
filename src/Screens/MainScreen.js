import React from "react";
import WeekSelect from "../components/WeekSelect";
import Header from "../components/Header";
import CalendarWeek from "../components/CalendarWeek";
import useOverlay from "../hooks/useOverlay";
import AddDateOverlay from "../components/Overlays/AddDateOverlay";

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
  const clickFree = (date) => {
    let start = new Date(date)
    let end = new Date(date)
    end.setHours(end.getHours()+1)
    console.log("### dates", start, end)
    let onSave = () => {
      setOverlay(null)
      //TODO
    }
    let onCancle = () => {
      setOverlay(null)
    }
    setOverlay(<AddDateOverlay startDate={start} endDate={end} onSave={onSave} onCancle={onCancle}/>)

  }

  const clickHour = ( data ) => {
    let start = new Date(data.start);
    let end = new Date(data.end);
    let name = data.what;
    setOverlay()
    let onSave = () => {
      setOverlay(null)
      //TODO
    }
    let onCancle = () => {
      setOverlay(null)
    }
    let onDelet = () => {

    }
    setOverlay(<AddDateOverlay name={name} startDate={start} endDate={end} onSave={onSave} onCancle={onCancle}/>)
  }

  
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