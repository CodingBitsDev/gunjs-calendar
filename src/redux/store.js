import { configureStore } from '@reduxjs/toolkit'
import { onSignedIn } from 'gunhelper';

import gunData, { initGunData } from "./reducer/gunData"

export const store = configureStore({
  reducer: {gunData},
})

window.store = store;

onSignedIn((signedIn) => {
  if(signedIn) store.dispatch(initGunData())
})