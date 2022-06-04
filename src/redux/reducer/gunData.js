import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import gunHelper, { gun } from '../../gun/gunHelper'
import { v4 as uuid } from 'uuid';
import { SEA } from 'gun';

const initialState = {
  initiated: false,
  selectedCalendar: [],
  calendars: {}
}

export const createCalendar = createAsyncThunk("gunData/createCalendar", async (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    try{
      let calendarKey = uuid()
      let currentMonth = new Date();
      currentMonth.setUTCDate(1);
      currentMonth.setUTCHours(0,0,0,0);
      let currentMonthKey = currentMonth.getTime();

      let keyPair = await SEA.pair();

      await (async (res) => {
      gunHelper.userAppRoot()
        .get("calendars")
        .get(calendarKey)
        .get("owner").put(await gunHelper.onceAsync("_user/name"))
        .back()
        .get("months").get(currentMonthKey).put(await SEA.encrypt([],keyPair))
        .back().back()
        .get("key").put(await gunHelper.encryptUser(keyPair))
      })();

      res();
    } catch(e){
      rej(e)
    }
  })
});

let trackedCalendars = []
export const initGunData = createAsyncThunk("gunData/initGunData", async (data, thunkAPI) => {
  return new Promise((res, rej) => {
    // gunHelper.on("_user/calendars", (calendars, gunKey, _msg, _ev) => {
    //   console.log("###", calendars)
    // //Download Calendars
    //   let calendarList = Object.entries(calendars).filter(([key, val]) => key != "_" && val)
    //   calendarList.forEach(async ([key, data]) => {
    //     if(data == null) return;
    //     if( !trackedCalendars.includes(key)){
    //       trackedCalendars.push(key)
    //       const calendarListener = (calendar) => {
    //         if(calendar == null) gunHelper.off(`_user/calendars/${key}`, calendarListener)
    //         let node = gunHelper.getNodeByPath(`_user/calendars/${key}`)
    //         node.load(async (data) => {
    //           let calendar = {...data}
    //           calendar.key = await gunHelper.decryptUser(data.key);
    //           await Promise.all(Object.entries(calendar).map(( [key, val] ) => {
    //             return new Promise(async res => {
    //               if(val?.startsWith?.("SEA")) calendar[key] = await SEA.decrypt(val, calendar.key)
    //               res();
    //             })
    //           }))
    //           await Promise.all(Object.entries(calendar.months || []).map(( [key, val] ) => {
    //             return new Promise(async res => {
    //               if(val?.startsWith?.("SEA")) calendar.months[key] = await SEA.decrypt(val, calendar.key)
    //               res();
    //             })
    //           }))

              
    //           thunkAPI.dispatch(calendarLoaded({ key, data:calendar }))
    //         }) 
    //       }
    //       gunHelper.on(`_user/calendars.${key}`, calendarListener)
    //     }
    //   });
    //   res();
    // })
  })
});

export const addDate = createAsyncThunk("gunData/addDate", (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let calendarId = data.id;
    let date = data.date;
    let calendar = thunkAPI.getState().gunData.calendars[calendarId];
    if(!calendar || !date) return rej();

    let calendarMonth= new Date(date.start);
    calendarMonth.setUTCDate(1);
    calendarMonth.setUTCHours(0,0,0,0);
    let calendarMonthKey = calendarMonth.getTime();

    let newMonth = [...( calendar.months[calendarMonthKey] || [] ), {...date, id: uuid()}]
    let encryptedMonth = await SEA.encrypt(newMonth, calendar.key)
    gunHelper.getNodeByPath(`_user/calendars/${calendarId}/months/${calendarMonthKey}`).put(encryptedMonth)
    res()
  })
});

export const removeDate = createAsyncThunk("gunData/removeDate", ({calendarId, monthId, dateId }, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let calendar = thunkAPI.getState().gunData.calendars[calendarId];
    if(!calendar || !monthId || !dateId) return rej();

    let newMonth = calendar.months[monthId].filter(date => date.id != dateId);
    let encryptedMonth = await SEA.encrypt(newMonth, calendar.key)
    gunHelper.getNodeByPath(`_user/calendars/${calendarId}/months/${monthId}`).put(encryptedMonth)
    res()
  })
});

export const editDate = createAsyncThunk("gunData/editDate", ({calendarId, monthId, date }, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let dateId = date?.id
    let calendar = thunkAPI.getState().gunData.calendars[calendarId];
    if(!date || !calendar || !monthId || !dateId) return rej();

    let newMonth = [...calendar.months[monthId].filter(date => date.id != dateId), date];
    let encryptedMonth = await SEA.encrypt(newMonth, calendar.key)
    gunHelper.getNodeByPath(`_user/calendars/${calendarId}/months/${monthId}`).put(encryptedMonth)
    res()
  })
});

window.createCalendar = createCalendar;
window.addDate = addDate;


export const counterSlice = createSlice({
  name: 'gunData',
  initialState,
  reducers: { 
    calendarLoaded: (state, { payload }) => {
      let calendarId = payload.key;
      state.calendars[calendarId] = payload.data;
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
export const { calendarLoaded } = counterSlice.actions

export default counterSlice.reducer