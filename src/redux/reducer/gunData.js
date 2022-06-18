import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import gunHelper, { gun } from '../../gun/gunHelper'
import { v4 as uuid } from 'uuid';
import { SEA } from 'gun';

const initialState = {
  initiated: false,
  selectedCalendar: [],
  calendars: {},
  activeCalendars: [],
  currentWeek: Date.now(),
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
      await gunHelper.put(`_user/calendars/${calendarKey}/key`, keyPair);
      await Promise.all([
        gunHelper.put(`_user/calendars/${calendarKey}/name`, data.name || "Main" ),
        gunHelper.put(`_user/calendars/${calendarKey}/owner`, gunHelper.onceAsync("_user/name") ),
        gunHelper.put(`_user/calendars/${calendarKey}/months/${currentMonthKey}`, []),
      ])

      let activeCalendars = await gunHelper.onceAsync("_user/activeCalendars") || [];
      activeCalendars.push(calendarKey)
      await gunHelper.put("_user/activeCalendars", activeCalendars)

      res();
    } catch(e){
      rej(e)
    }
  })
});

export const removeCalendar = createAsyncThunk("gunData/removeCalendar", async (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    try{
      let calendarId = data.calendarId;
      if(!calendarId) return rej();
      let activeCalendars = await gunHelper.onceAsync("_user/activeCalendars");
      if(activeCalendars.includes(calendarId)){
        activeCalendars = activeCalendars.filter(i => i != calendarId);
        await gunHelper.put("_user/activeCalendars", activeCalendars)
      }
      await gunHelper.put(`_user/calendars/${calendarId}`, null);

      res({ calendarId });
    } catch(e){
      rej(e)
    }
  })
});

export const setActiveCalendars = createAsyncThunk("gunData/setActiveCalendars", async (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    try{
      if(!data.activeCalendars) return rej();

      await gunHelper.put(`_user/activeCalendars`, data.activeCalendars);

      res();
    } catch(e){
      rej(e)
    }
  })
});

let trackedCalendars = []
export const initGunData = createAsyncThunk("gunData/initGunData", async (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let activeCalendars = await gunHelper.onceAsync("_user/activeCalendars");
    gunHelper.on("_user/activeCalendars", (activeCalendars) => {
      if(activeCalendars) thunkAPI.dispatch(updateActiveCalendars({activeCalendars}))
    })

    gunHelper.on("_user/calendars", (calendars, gunKey, _msg, _ev) => {
    //Download Calendars
      let removedCalendars = Object.entries(calendars).filter(([key, val]) => key != "_" && !val).map(([key]) => key)
      let currentCalendars = thunkAPI.getState()?.gunData?.calendars;
      if(removedCalendars.some(key => !!currentCalendars[key])) thunkAPI.dispatch(updateRemovedCalendars({removedCalendars}));

      let calendarList = Object.entries(calendars).filter(([key, val]) => key != "_" && val).filter(Boolean)
      calendarList.forEach(async ([key, data]) => {
        if( !trackedCalendars.includes(key)){
          trackedCalendars.push(key)
          const calendarListener = (function (calendar){
            if(calendar == null) {
              gunHelper.off(`_user/calendars/${key}`, calendarListener)
              return
            }
            let now = Date.now()
            gunHelper.load(`_user/calendars/${key}`, (data => {
              thunkAPI.dispatch(calendarLoaded({ key, data }))
            }))
          }).debounce(1000)
          gunHelper.on(`_user/calendars/${key}`, calendarListener)
        }
      });

      if(!activeCalendars) {
        activeCalendars = calendarList.map(([key]) => key)
        gunHelper.put("_user/activeCalendars", activeCalendars);
      }

      //Set loaded calendars to active
      res({activeCalendars: calendarList.map(([key]) => key), existentCalendar: calendarList.map(([key]) => key)});
    })
  })
});

export const addDate = createAsyncThunk("gunData/addDate", (data, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let calendarId = data.calendarId;
    let date = data.date;
    let calendar = thunkAPI.getState()?.gunData?.calendars?.[calendarId];
    if(!calendar || !date) return rej("Calendar or date not correct");

    let calendarMonth= new Date(date.start);
    calendarMonth.setUTCDate(1);
    calendarMonth.setUTCHours(0,0,0,0);
    let calendarMonthKey = calendarMonth.getTime();

    let newMonth = [...( calendar.months[calendarMonthKey] || [] ), {...data, id: uuid()}]
    await gunHelper.put(`_user/calendars/${calendarId}/months/${calendarMonthKey}`, newMonth)
    res({ calendarId, monthId:calendarMonthKey, newMonth })
  })
});

export const removeDate = createAsyncThunk("gunData/removeDate", ({monthId, dateId, calendarId}, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let calendar = thunkAPI.getState().gunData.calendars[calendarId];
    if(!calendar || !monthId || !dateId) return rej();

    let newMonth = calendar.months[monthId].filter(date => date.id != dateId);
    await gunHelper.put(`_user/calendars/${calendarId}/months/${monthId}`, newMonth)
    res({ calendarId, monthId, newMonth })
  })
});

export const editDate = createAsyncThunk("gunData/editDate", ({monthId, date }, thunkAPI) => {
  return new Promise(async (res, rej) => {
    let calendarId = date.calendarId;
    let dateId = date?.id
    let calendar = thunkAPI.getState().gunData.calendars[calendarId];
    if(!date || !calendar || !monthId || !dateId) return rej();

    let newMonth = [...calendar.months[monthId].filter(date => date.id != dateId), date];
    await gunHelper.put(`_user/calendars/${calendarId}/months/${monthId}`, newMonth)
    res({calendarId, monthId, newMonth})
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
      let removed = payload.removed
      if(removed) delete state.calendars[calendarId];
      else state.calendars[calendarId] = payload.data;
    },
    updateRemovedCalendars: (state, { payload }) => {
      let removedCalendars = payload.removedCalendars || [];
      removedCalendars.forEach(key => {
        delete state.calendars[key]
      })
    },
    setCurrentWeek: (state, { payload }) => {
      if(payload.week) state.currentWeek = payload.week
    },
    updateActiveCalendars: (state, { payload }) => {
      state.activeCalendars = payload.activeCalendars || []
    }
  },
  extraReducers: {
    [removeCalendar.fulfilled]: (state, action) => {
      let calendarId = action.payload.calendarId;
      if(!calendarId) return;
      delete state.calendars[calendarId]
    },
    [initGunData.pending]: (state, actions) => {},
    [initGunData.fulfilled]: (state, {payload}) => {
      state.initiated = true;
      let currentWeek = new Date();
      let dayDiff = currentWeek.getDay() - 1
      currentWeek.setDate(currentWeek.getDate() - dayDiff);
      currentWeek.setHours(0,0,0,0);
      state.currentWeek = currentWeek.getTime();

      //All Callendars
      state.activeCalendars = payload.activeCalendars;
    },
    [initGunData.rejected]: (state, {payload}) => {

    },
    [addDate.fulfilled]: (state, {payload}) => {
      let {calendarId, monthId, newMonth} = payload;
      state.calendars[calendarId].months[monthId] = newMonth
    },
    [removeDate.fulfilled]: (state, {payload}) => {
      let {calendarId, monthId, newMonth} = payload;
      state.calendars[calendarId].months[monthId] = newMonth
    },
    [editDate.fulfilled]: (state, {payload}) => {
      let {calendarId, monthId, newMonth} = payload;
      state.calendars[calendarId].months[monthId] = newMonth
    },
  }
})

// Action creators are generated for each case reducer function
export const { calendarLoaded, setCurrentWeek, updateActiveCalendars, updateRemovedCalendars } = counterSlice.actions

export default counterSlice.reducer