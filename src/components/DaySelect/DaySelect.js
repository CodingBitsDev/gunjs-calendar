import { useEffect, useState, useRef } from "react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import "./index.scss"
import { useForm } from "react-hook-form";
import TimePicker from "../TimePicker";

let minuteExclude = []
for (let index = 0; index < 60; index++) {
  if(index % 5 != 0) minuteExclude.push(index)
}


function DaySelect({ title, defaultValue, onSetDay, className}){
  let [day, setDay] = useState(new Date(defaultValue || Date.now()))
  let [showDayPicker, setShowDayPicker] = useState(false)
  let [showTimePicker, setShowTimePicker] = useState(false)
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    let dayString = getDayString(day)
    setValue("day", dayString)
    setValue("time", getHourString(day.getHours(), day.getMinutes()))
    onSetDay?.(day) 
  },[day])

  let prevActive = useRef("none")
  useEffect(() => {
    if(prevActive.current == "time" && showDayPicker){
      prevActive.current = "day"
      setShowTimePicker(false) 
    } else if(prevActive.current == "day" && showTimePicker){
      prevActive.current = "time"
      setShowDayPicker(false) 
    } else {
      prevActive.current = showDayPicker ? "day" : showTimePicker ? "time" : "none" 
    } 
  },[showDayPicker, showTimePicker])

  const setDayVal = (val) => {
    if(val) {

      let newDay = new Date(val);
      newDay.setHours(day.getHours())
      newDay.setMinutes(day.getMinutes())
      setDay(newDay)
    }
    setShowDayPicker(false)
  }

  const setTimeVal = (val) => {
    let time = val.split(":").map(Number)
    let newDay = new Date(day);
    newDay.setHours(time[0])
    newDay.setMinutes(time[1])
    setDay(newDay)
  }

  return (
    <div className={`w-full flex flex-col ${className}` }>
      <label className="text-white font-bold mb-2">{ title }</label>
      <div className="flex items-center justify-center">
        <div className={`w-full flex flex-col relative mr-2` }>
          <input 
            className={`w-44 rounded-md px-2 ${showDayPicker ? " rounded-b-none" : ""} focus-visible:outline-none`}
            onClick={()=>{setShowDayPicker(!showDayPicker)}}
            readOnly
            required
            type="text"
            {...register("day")}
          />
          { showDayPicker && (
            <div className="absolute z-10 bg-black top-6 border-2 border-white rounded-xl rounded-tl-none transform">
              <DayPicker
                mode="single"
                selected={day}
                onSelect={setDayVal}
              />
            </div>
          )}
        </div>
        <div className="bg-white rounded-md">
          <input 
            className={`w-16 rounded-md px-2 ${showTimePicker ? " rounded-b-none" : ""} focus-visible:outline-none select-none`}
            onClick={() => setShowTimePicker(!showTimePicker)}
            required
            type="text"
            readOnly
            {...register("time")}
          />
          <div className={`absolute z-10 bg-black top-18 right-6 border-2 border-white rounded-xl rounded-tr-none ${!showTimePicker ? "hidden" : ""}`}>
            <TimePicker 
              defaultValue={getHourString(day.getHours(), day.getMinutes())}
              onChange={setTimeVal}
              minuteExclude={minuteExclude}
              notShowExclude
            />
          </div>
        </div>
      </div>
    </div>
  );
  return null;
}

export default DaySelect

function getHourString(hour, minute){
  let hourString = Number(hour) > 9 ? hour : "0" + hour;
  hourString += ":"
  if(!minute) hourString += "00";
  else hourString += Number(minute) > 9 ? minute : "0" + minute
  return hourString;
}

function getDayString(date){
  let day = date.getDate();
  let month = date.getMonth();
  let weekDays = date.getDay()

  let dayString = "";
  dayString += day > 9 ? day : "0" + day
  dayString += ".";
  dayString += month > 9 ? month : "0" + month
  dayString += ".";
  dayString += date.getFullYear()
  return dayString;
}