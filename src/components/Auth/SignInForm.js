import React, {useEffect} from "react";
import { useForm } from "react-hook-form";

const SignInForm = ({ onSignIn }) => {
  const { setFocus, register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  return (
    <>
      <form 
        className="flex flex-col w-full items-end"
        onSubmit={handleSubmit(({name, pw}) => {
          onSignIn(name, pw)
        })}
      >
        <div>
          <input className="bg-black p-2 rounded w-full md:w-auto md:mr-5 md:mb-0 mr-0 mb-5 text-white placeholder-gray-100" placeholder="Name" {...register("name")}/>
          <input className="bg-black p-2 rounded w-full md:w-auto text-white placeholder-gray-100" type="password" placeholder="Passphrase" {...register("pw")}/>
        </div>
        <input className="bg-black mt-5 p-2 rounded text-white placeholder-gray-100" type="submit" value="sign in"/>
      </form>
    </>
  )
}
export default SignInForm;