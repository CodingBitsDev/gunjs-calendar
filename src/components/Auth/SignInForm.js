import React from "react";
import { useForm } from "react-hook-form";

const SignInForm = ({ onSignIn }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  return (
    <>
      <form 
        className="mb-5"
        onSubmit={handleSubmit(({name, pw}) => {
          onSignIn(name, pw)
        })}
      >
        <input className="bg-black p-2 rounded mr-5 text-white placeholder-gray-100" placeholder="Name" {...register("name")}/>
        <input className="bg-black p-2 rounded mr-5 text-white placeholder-gray-100" type="password" placeholder="Passphrase" {...register("pw")}/>
        <input className="bg-black p-2 rounded mr-5 text-white placeholder-gray-100" type="submit" value="sign in"/>
      </form>
    </>
  )
}
export default SignInForm;