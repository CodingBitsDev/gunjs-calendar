import React, { useEffect, useState } from "react";
import PinForm from "../components/Auth/PinForm";
import SignInForm from "../components/Auth/SignInForm";
import SignUpForm from "../components/Auth/SignUpForm";
import useGunAuth from "../gun/hooks/useGunAuth";

const AuthScreen = () => {
  let {isSignedIn, showPin, error, signIn, signUp, recall, resetError} = useGunAuth(true)
  let [ showSignUp, setShowSignUp ] = useState(false);
  let [ usePin, setUsePin ] = useState(true)

  useEffect(() => {
    resetError();
  },[showSignUp])

  let headerState = "";
  if(usePin && showPin) headerState = "pin";
  if(!( usePin && showPin ) && showSignUp) headerState = "signUp";
  if(!( usePin && showPin ) && !showSignUp) headerState = "signIn";

  return (
    <div className="flex flex-col items-center pt-10 bg-black w-screen h-screen">
      <div className="bg-gray-100 p-12 m-10 rounded-lg flex-col max-w-full flex">
        <LoginHeader state={ headerState } setUsePin={setUsePin} setShowSignUp={setShowSignUp}/>
        {!( usePin && showPin ) && showSignUp && <SignUpForm onSignUp={signUp}/> }
        {!( usePin && showPin ) && !showSignUp && <SignInForm onSignIn={signIn}/> }
        {( usePin && showPin ) && <PinForm onEnterPin={recall}/>}
        <p className="text-red-600 mt-5">{error}</p>
      </div>
    </div>
  )
}
export default  AuthScreen;

const LoginHeader = ({ state, setUsePin, setShowSignUp }) => {
  if(state == "pin"){
    return <div className="flex w-full mb-8">
      <h1 className="text-2xl font-bold">Pin</h1>
      <div className="grow"/>
      <button onClick={() => setUsePin(false)}>Sign In</button>
    </div>
  }
  if(state == "signUp"){
    return <div className="flex w-full mb-8">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <div className="grow"/>
      <button onClick={() => setShowSignUp(false)}>Sign In</button>
    </div>
  }
  if(state == "signIn"){
    return <div className="flex w-full mb-8">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <div className="grow"/>
      <button onClick={() => setShowSignUp(true)}>Sign Up</button>
    </div>
  }
  return null
}