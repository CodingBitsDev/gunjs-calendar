import React, {useState, useEffect, useRef} from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles(
  {
    parent: {
      display: "flex",
      direction: "ltr",
      "&>*": {
        margin: "0 5px",
      },
      "&>:last-child": {
        marginRight: "0",
      },
      "&>:first-child": {
        marginLeft: "0",
      },
    },
    control: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    control__time: {
      cursor: "pointer",
      transition: "opacity 0.5s",
      "&:hover": {
        opacity: 0.5,
      },
    },
    control__svg: {
      stroke: "#ffffff",
    },
    wrapper: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "128px",
      width: "64px",
      overflow: "hidden",
      userSelect: "none",
    },
    selector: {
      width: "100%",
      height: "40px",
      backgroundColor: "#5350ff",
      position: "absolute",
      top: "39px",
      borderRadius: "8px",
    },
    timeWrapper: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      lineHeight: "40px",
      fontSize: "20px",
      transition: "transform 0.5s",
      paddingTop: "40px",
    },
    time: {
      zIndex: "1",
      color: "#ffffff",
      opacity: "0.5",
      transition: "color 0.5s",
    },
    selected: {
      color: "#fff",
      opacity: "1",
    },
    disabled: {
      opacity: "0.2 !important",
    },
  },
  {
    name: "time-picker",
  }
);

function TimePicker({ onChange, defaultValue, minuteExclude, hourExclude, notShowExclude,}){
  const classes = useStyles();

  const [hour, setHour] = useState(defaultValue ? defaultValue.split(":")[0] : "00");
  const [minute, setMinute] = useState(defaultValue ? defaultValue.split(":")[1] : "00");

  useEffect(() => {
    onChange && onChange(`${hour}:${minute}`);
  }, [hour, minute]);

  return (
    <div className={classes.parent}>
      <TimeColumn
        notShowExclude={notShowExclude}
        start={0}
        end={23}
        value={hour}
        setValue={setHour}
        exclude={hourExclude}
      />
      <TimeColumn
        notShowExclude={notShowExclude}
        start={0}
        end={59}
        value={minute}
        setValue={setMinute}
        exclude={minuteExclude}
      />
    </div>
  );
}

export default TimePicker

const TimeColumn = ({ start, end, setValue, value, exclude, notShowExclude }) => {
  const classes = useStyles();

  const [slecetorMove, setSlecetorMove] = useState(value ? Number(value) : 0);

  const timeArray = [];
  for (let time = start; time <= end; time++) {
    if (notShowExclude) !exclude?.includes(time) && timeArray.push(time);
    else timeArray.push(time);
  }

  useEffect(() => {
    let prev = slecetorMove;
    if (exclude?.includes(prev)) {
      while (exclude?.includes(prev)) {
        prev = prev + 1;
        setSlecetorMove(prev);
      }
    }
  }, []);

  useEffect(() => {
    setValue(slecetorMove.toString().length === 1 ? `0${slecetorMove}` : slecetorMove.toString());
  }, [slecetorMove]);

  const controlBottom = () => {
    let prev = slecetorMove;
    if (prev !== end) {
      if (exclude?.includes(prev + 1)) {
        while (exclude?.includes(prev + 1)) {
          if (prev + 2 > end) {
            return setSlecetorMove(start);
          }
          prev = prev + 1;
          setSlecetorMove(prev + 1);
        }
      } else {
        return setSlecetorMove(prev + 1);
      }
    } else {
      return setSlecetorMove(start);
    }
  };

  const controlTop = () => {
    let prev = slecetorMove;
    if (prev !== start) {
      if (exclude?.includes(prev - 1)) {
        while (exclude?.includes(prev - 1)) {
          if (prev - 2 < start) {
            return setSlecetorMove(end);
          }
          prev = prev - 1;
          setSlecetorMove(prev - 1);
        }
      } else {
        return setSlecetorMove(prev - 1);
      }
    } else {
      let endnumber = end;
      if (exclude?.includes(end)) {
        while (exclude?.includes(endnumber - 1)) {
          endnumber = endnumber - 1;
          setSlecetorMove(endnumber - 1);
        }
      } else {
        return setSlecetorMove(end);
      }
    }
  };

  return (
    <div className={classes.control}>
      <div className={classes.control__time} onClick={controlTop}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.9201 15.0499L13.4001 8.52989C12.6301 7.75989 11.3701 7.75989 10.6001 8.52989L4.08008 15.0499"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={classes.control__svg}
          />
        </svg>
      </div>
      <div className={classes.wrapper}>
        <div className={classes.selector} />
        <div
          className={classes.timeWrapper}
          style={{
            transform: `translateY(-${slecetorMove && timeArray.indexOf(slecetorMove) * 40}px)`,
          }}
        >
          {timeArray.map((time) => (
            <div
              key={time}
              className={`${classes.time} ${+time === slecetorMove ? classes.selected : ""} ${
                exclude && exclude.includes(+time) ? classes.disabled : ""
              }`}
            >
              {time.toString().length === 1 ? `0${time}` : time}
            </div>
          ))}
        </div>
      </div>
      <div className={classes.control__time} onClick={controlBottom}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.9201 8.94995L13.4001 15.47C12.6301 16.24 11.3701 16.24 10.6001 15.47L4.08008 8.94995"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={classes.control__svg}
          />
        </svg>
      </div>
    </div>
  );
};
