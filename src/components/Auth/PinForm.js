import React, {useEffect} from "react";
import { useForm } from "react-hook-form";

const PinForm = ({ onEnterPin }) => {
  const { register, setFocus, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => {
    setFocus("pin");
  }, [setFocus]);

  return (
    <>
      <form 
        className="flex w-full justify-between"
        onSubmit={handleSubmit(({pin}) => {
          onEnterPin(pin)
        })}
      >
        <input className="bg-black p-2 rounded text-white placeholder-gray-100 w-1/2" type="password" placeholder="Pin" {...register("pin")}/>
        <input className="hidden" type="submit"></input>
        <button className="bg-black p-2 rounded text-white placeholder-gray-100 h-fit w-1/4" type="submit">Enter Pin</button>
      </form>
    </>
  )
}
export default PinForm;