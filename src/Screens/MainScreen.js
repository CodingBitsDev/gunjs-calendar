import React from "react";
import WeekSelect from "../components/WeekSelect";
import Header from "../components/Header";
import CalendarWeek from "../components/CalendarWeek";

const MainScreen = () => {
  return (
    <div className="flex flex-col w-screen h-screen bg-black">
      <Header 
        title={"Calendar"}
        rightElem={<WeekSelect/>}
      />
      <div className="w-full h-full">
        <CalendarWeek/>
      </div>
    </div>
  )
}
export default MainScreen;