import { useEffect } from "react";
import { useForm } from "react-hook-form";

function AddCalendarOverlay({ onCancle, onSave }){
  const { setFocus, register, handleSubmit, watch, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    setFocus("name")
  },[])

  const onSubmit = (data) => {
    onSave?.(data.name)
  }

  const cancle = () => {
    onCancle?.()
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="w-auto h-auto bg-black p-6 flex flex-col border-2 border-white rounded-xl relative">
      <div className="flex">
        <h1 className="text-white text-2xl font-bold mb-1">{"Create Calendar"}</h1>
      </div>
      <div className="w-full border-b-2 h-0 mb-2 "></div>
      <label className="text-white font-bold mb-2">Name</label>
      <input required className="mb-5 px-2 rounded-md outline-none" placeholder="Name" defaultValue={""} type={"text"} {...register("name")}/>
      <input className="hidden" type={"submit"}/>
      <div className="mt-6 flex">
        <button 
          className="bg-yellow-700 text-white rounded-md grow mr-4"
          onClick={cancle}
        >
          Cancle
        </button>
        <button 
          style={{ backgroundColor: "#5350ff" }}
          className="rounded-md grow text-white"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
  return null;
}

export default AddCalendarOverlay