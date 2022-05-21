import gun from "./index"
import SEA from "gun/sea"

const signInListener = new Set()

export function canRecall(){
  const gun_auth = localStorage.getItem('gun_auth');
  return !!gun_auth;
}

export function recall(pin){
  return new Promise(async (resolve) => {
    const gun_auth = localStorage.getItem('gun_auth');
    if (!gun_auth) return;
    let auth = await SEA.decrypt(gun_auth, pin);
    if(!auth?.name || !auth?.pw) return resolve({err: "Pin Incorrect"})
    signIn(auth.name, auth.pw, false).then((result) => {
      //{err} || user
      resolve(result)
    })
  })
}

export async function signUp(name, pw, pin){
  return new Promise(async (resolve) => {
    gun.user().create(name, pw, async ({ ok, pub, err }) => {
      if(err) return resolve({ err })
      if(ok == 0 && pub){
        resolve(await signIn(name, pw, pin))
      } 
    })
  }); 
}

export function signIn(name, pw, persist){
  return new Promise(async ( resolve ) => {
    await gun.user().auth(name, pw, async (user) => {
      if (user.err) return resolve(user)
      let onPersistError = (e) => {
        console.e("Could not persist user", e)
      };
      await persistUser(name, pw, persist).then((persistResult) => {
        if(!persistResult && persist) onPersistError(persistResult)
        notifySignInListener(true);
        resolve(user)
      })
    });
  })
}

export function onSignedIn(cb){
  if(gun.user().is) cb(true)
  signInListener.add(cb);
}

function persistUser(name, pw, pin){
  return new Promise(async (resolve) => {
    let savedPin = await gun.getValAsync("auth_pin", gun.userAppRoot())
    let pinNumber = !isNaN(parseFloat(pin)) ? parseFloat(pin) : savedPin;
    if(!pinNumber) return resolve(true);
    if(!savedPin || true){
      await gun.userAppRoot().get("auth_pin").put(pinNumber);
    }
    console.log("###", pin, pinNumber, savedPin)
    let authData = await SEA.encrypt({name,pw: pw}, pinNumber)
    localStorage.setItem("gun_auth", authData);
    resolve(true);
  })
}

function notifySignInListener(signedIn){
  signInListener.forEach((cb) => cb(signedIn))
}



window.signUp = signUp