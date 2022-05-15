import React from "react";
import { useForm } from "react-hook-form";

const PinForm = ({ onEnterPin }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  return (
    <>
      <form 
        className="mb-5"
        onSubmit={handleSubmit(({pin}) => {
          onEnterPin(pin)
        })}
      >
        <input className="bg-black p-2 rounded mr-5 text-white placeholder-gray-100" type="password" placeholder="Pin" {...register("pin")}/>
        <input className="bg-black p-2 rounded mr-5 text-white placeholder-gray-100" type="submit" value="Enter Pin"/>
      </form>
    </>
  )
}
export default PinForm;