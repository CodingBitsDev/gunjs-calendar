import React, {useEffect} from "react";
import { useForm } from "react-hook-form";

const SignUpForm = ({ onSignUp }) => {
  const { setFocus, register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  return (
    <>
      <form 
        className=""
        onSubmit={handleSubmit(({name, pw, pin, alias}) => {
          onSignUp(name, pw, alias, pin)
        })}
      >
        <div>
          <input className="bg-black p-2 rounded w-full md:w-auto md:mr-5 md:mb-0 mr-0 mb-5 text-white placeholder-gray-100" placeholder="Name" {...register("name")}/>
          <input className="bg-black p-2 rounded w-full md:w-auto text-white placeholder-gray-100" type="password" placeholder="Passphrase" {...register("pw")}/>
        </div>
        <div className="mt-5">
          <input className="bg-black p-2 rounded w-full md:w-auto md:mr-5 md:mb-0 mr-0 mb-5 text-white placeholder-gray-100" type="Alias" placeholder="Alias" {...register("alias")}/>
          <input className="bg-black p-2 rounded w-full md:w-auto text-white placeholder-gray-100" type="Pin" placeholder="Pin" {...register("pin")}/>
        </div>
        <div className="mt-5">
          <div className="grow"/>
          <input className="bg-black p-2 rounded text-white placeholder-gray-100" type="submit" value="Sign Up"/>
        </div>
      </form>
    </>
  )
}
export default SignUpForm;