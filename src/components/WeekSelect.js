import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWeek } from "../redux/reducer/gunData";

const WeekSelect = ({}) => {
  let selectedWeek = useSelector((state) => state?.gunData?.currentWeek)
  let dispatch = useDispatch();

  let weekNumber = getWeekNumber(new Date(selectedWeek))

  let setNextWeek = () => {
    let currentWeek = new Date(selectedWeek + 1000 * 60 * 60 * 24 * 7);
    let dayDiff = currentWeek.getDay() - 1
    currentWeek.setDate(currentWeek.getDate() - dayDiff);
    currentWeek.setHours(0,0,0,0);
    dispatch(setCurrentWeek({week: currentWeek.getTime() }))
  }

  let setPrevWeek = () => {
    let currentWeek = new Date(selectedWeek - 1000 * 60 * 60 * 24 * 7);
    let dayDiff = currentWeek.getDay() - 1
    currentWeek.setDate(currentWeek.getDate() - dayDiff);
    currentWeek.setHours(0,0,0,0);
    dispatch(setCurrentWeek({week: currentWeek.getTime()}))
  }

  return <div className="text-white flex items-center">
    <div onClick={setPrevWeek} className="bg-blue-500 w-8 h-8 mr-4 rounded font-bold flex items-center justify-center cursor-pointer">{"<"}</div>
    <div>{`Week ${weekNumber[1]} (${weekNumber[0]})`}</div>
    <div onClick={setNextWeek} className="bg-blue-500 w-8 h-8 ml-4 rounded font-bold flex items-center justify-center cursor-pointer">{">"}</div>
  </div>;
}

export default WeekSelect

function getWeekNumber(d) {
    let currentWeek = new Date(d.getTime());
    let dayDiff = currentWeek.getDay() - 1
    currentWeek.setDate(currentWeek.getDate() - dayDiff);
    currentWeek.setHours(0,0,0,0);

    // Make Sunday's day number 7
    // Get first day of year
    var yearStart = new Date(currentWeek.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (currentWeek - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [currentWeek.getFullYear(), weekNo];
}