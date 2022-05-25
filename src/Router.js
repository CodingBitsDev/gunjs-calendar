import React, { useEffect, useState } from "react";
import AddDateOverlay from "./components/Overlays/AddDateOverlay";
import useGunAuth from "./gun/hooks/useGunAuth";
import useOverlay from "./hooks/useOverlay";
import AuthScreen from "./Screens/AuthScreen";
import MainScreen from "./Screens/MainScreen";

const Router = () => {
  let {isSignedIn} = useGunAuth(true)
  let [routeState, setRouteState] = useState("none");

  let [ overlay, setOverlay ] = useOverlay()

  useEffect(() => {
    if(!isSignedIn) setRouteState("authScreen");
    else setRouteState("main");
  },[ isSignedIn ])
  
  return (
    <>
      {routeState == "authScreen" && <AuthScreen/>} 
      {routeState == "main" && <MainScreen/>} 

      {!!overlay || true && (
        <div className="z-100 w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto h-auto">
          <AddDateOverlay className="" />
        </div>
      )}
    </>
    
  )

}
export default  Router;