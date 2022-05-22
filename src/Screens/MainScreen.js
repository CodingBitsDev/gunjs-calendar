import React from "react";
import WeekSelect from "../components/WeekSelect";
import Header from "../components/Header";
import CalendarWeek from "../components/CalendarWeek";

let week = [
  { date:"05.22.2022", hours : [{start: "05.22.2022 10:0", end: "05.22.2022 12:30", who: "Bjoern"}]},
  { date:"05.23.2022", hours : [{start: "05.23.2022 10:00", end: "05.23.2022 11:00", who: "Bjoern"}]},
  { date:"05.24.2022", hours : []},
  { date:"05.25.2022", hours : []},
  { date:"05.26.2022", hours : [{start: "05.26.2022 10:00", end: "05.26.2022 16:00", who: "Nils"}, {start: "05.26.2022 17:00", end: "05.26.2022 18:00", who: "Nils"}]},
  { date:"05.27.2022", hours : [{start: "05.27.2022 10:00", end: "05.27.2022 11:00", who: "Bjoern"}]},
  { date:"05.28.2022", hours : [{start: "05.28.2022 10:00", end: "05.28.2022 11:00", who: "Bjoern"}]},
]

const MainScreen = () => {
  return (
    <div className="flex flex-col w-screen h-screen bg-black">
      <Header 
        title={"Calendar"}
        rightElem={<WeekSelect/>}
      />
      <div className="w-full h-full">
        <CalendarWeek weekDays={week}/>
      </div>
    </div>
  )
}
export default MainScreen;