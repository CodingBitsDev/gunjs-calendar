import React from "react";
import PinForm from "../components/Auth/PinForm";
import SignInForm from "../components/Auth/SignInForm";
import SignUpForm from "../components/Auth/SignUpForm";
import useGunAuth from "../gun/hooks/useGunAuth";

const AuthScreen = () => {
  let {isSignedIn, showPin, error, signIn, signUp, recall} = useGunAuth(true)
  return (
    <div className="App flex flex-col items-center pt-10 bg-black w-screen h-screen">
      <div className="bg-gray-100 p-12 rounded-lg">
        <SignInForm/>
        <SignUpForm/>
        <PinForm/>
      </div>
    </div>
  )
}
export default  AuthScreen;