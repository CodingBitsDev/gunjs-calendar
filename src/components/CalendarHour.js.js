import React from "react";

const CalendarHour = ({refFunc, isCurrentDay, firstWeek, firstHour, lastWeek, lastHour, bigText, subText, smallText, onClickFree}) => {
  let refProp = refFunc ? {ref: refFunc} : {}
  return ( 
    <div 
      onClick={onClickFree}
      {...refProp}
      style={{minHeight: "5rem"}}
      className={
        `grow h-20 border-white border-l-2 border-t-2 flex
        ${isCurrentDay ? "bg-gray-900" : "bg-black"}
        ${firstHour ? "border-b-2" : ""}
        ${lastWeek ? "border-r-2" : ""}
        ${lastHour ? "border-b-2" : ""}
        ${!!bigText ? `flex-col items-center justify-center sticky top-0 bg-black z-10` : "items-start justify-start relative"} 
        ${onClickFree ? "cursor-pointer hover:bg-gray-800" : ""}
        `
      }>
        {!!bigText && <h1 className="text-white text-xl font-bold">{bigText}</h1>}
        {!!bigText && <h2 className="text-white text-sm font-bold">{subText}</h2>}
        {!bigText && smallText && <h1 className="text-white text-sm absolute left-1 top-1">{smallText}</h1>}
    </div>
  );
}

export default CalendarHour; 