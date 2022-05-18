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
        className="flex w-full"
        onSubmit={handleSubmit(({pin}) => {
          onEnterPin(pin)
        })}
      >
        <input className="bg-black p-2 rounded mr-5 text-white placeholder-gray-100" type="password" placeholder="Pin" {...register("pin")}/>
        <div className="grow"/>
        <input className="bg-black p-2 rounded text-white placeholder-gray-100" type="submit" value="Enter Pin"/>
      </form>
    </>
  )
}
export default PinForm;