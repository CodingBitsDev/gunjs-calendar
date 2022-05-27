import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import gun from '../../gun'
import { v4 as uuid } from 'uuid';

const initialState = {
  initiated: false,
  selectedCalendar: [],
  calendars: {}
}

export const createCalendar = createAsyncThunk("gunData/createCalendar", async (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let calendarId = uuid()
    let currentMonth = new Date();
    currentMonth.setUTCDate(1);
    currentMonth.setUTCHours(0,0,0,0);
    let currentMonthKey = currentMonth.getTime();

    gun.userAppRoot()
      .get("calendars")
      .get(calendarId)
      .get(currentMonthKey).put(await gun.encryptUser([]))
      .back().get("owner").put()

    thunkAPI.dispatch(calendarAdded({calendarId, data: {currentMonth:[]}}))
  })
  //Get Selected Calendar
  //
});

export const initGunData = createAsyncThunk("gunData/initGunData", async (data, thunkAPI) => {
  return new Promise((res, rej) => {
    //Download Calendars
    gun.addListener("user.calendars", (calendars) => {
    })
  })
  //Get Selected Calendar
  //
});

export const counterSlice = createSlice({
  name: 'gunData',
  initialState,
  reducers: { 
    calendarAdded: (state, { payload }) => {

    }

  },
  extraReducers: {
    [initGunData.pending]: (state, actions) => {},
    [initGunData.fulfilled]: (state, {payload}) => {
      console.log("### gunData initiated")
    },
    [initGunData.rejected]: (state, {payload}) => {

    }
  }
})

// Action creators are generated for each case reducer function
export const { calendarAdded } = counterSlice.actions

export default counterSlice.reducer