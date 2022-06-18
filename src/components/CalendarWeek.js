import React from "react";
import CalendarDay from "./CalendarDay.js";

const CalendarWeek = ({weekDays = [], onClickFree, onClickHour}) => {
  return <div className="w-full h-full relative overflow-y-auto">
    <div className="w-full h-auto flex absolute">
      {weekDays.map((day, index) => {
        let key = day.date || Math.floor( Math.random() * 10000 )
        return <CalendarDay onClickFree={onClickFree} onClickHour={onClickHour} first={index==0} last={index == weekDays.length -1} key={key} day={day}/>
      })}
    </div>;
  </div> 
}

export default CalendarWeek; 