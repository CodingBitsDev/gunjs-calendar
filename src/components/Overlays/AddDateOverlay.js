import { useEffect, useState } from "react";
import { DayPicker } from 'react-day-picker';
import { useForm } from "react-hook-form";
import DaySelect from "../DaySelect/DaySelect";

function AddDateOverlay({ startDate, endDate, name, onSave, onCancle, onDelete, isEdit}){
  console.log(startDate, endDate)
  let [start, setStart] = useState(new Date(startDate))
  let [end, setEnd] = useState(new Date(endDate || Date.now()))
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();

  const onSubmit = (data) => {
    onSave?.(start, end, data.name)
  }

  const cancle = () => {
    onCancle()
  }

  const deletePressed  = () => {
    onDelete?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <label className="text-white font-bold mb-2">Name</label>
      <input required className="mb-5 px-2 rounded-md outline-none" placeholder="Name" defaultValue={name || ""} type={"text"} {...register("name")}/>
      <DaySelect 
        className={`mb-4 -mt-2`}
        title={"Start"}
        defaultValue={start}
        onSetDay={setStart}
      />
      {<DaySelect title={"End"} defaultValue={end} onSetDay={setEnd}/>}
      <div className="mt-6 flex">
        { isEdit && (
          <button onClick={deletePressed} className="bg-red-600 rounded-md grow mr-4" > Remove </button>
        )}
        <button 
          className="bg-yellow-500 rounded-md grow mr-4"
          onClick={cancle}
        >
          Cancle
        </button>
        <button 
          className="bg-blue-700 rounded-md grow"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
  return null;
}

export default AddDateOverlay