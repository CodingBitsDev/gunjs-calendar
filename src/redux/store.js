import { configureStore } from '@reduxjs/toolkit'
import { onSignedIn } from '../gun/auth';

import gunData, { initGunData } from "./reducer/gunData"

export const store = configureStore({
  reducer: {gunData},
})

window.store = store;

onSignedIn((signedIn) => {
  console.log("####")
  if(signedIn) store.dispatch(initGunData())
})