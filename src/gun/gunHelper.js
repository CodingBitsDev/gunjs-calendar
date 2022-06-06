import GUN from "gun/gun.js"
import SEA from "gun/sea"
import "gun/lib/yson.js";
import "gun/lib/dom.js"
import "gun/lib/upload.js"
import "gun/lib/load.js";
import "gun/lib/radix"
import "gun/lib/radisk"
import "gun/lib/store"
import "gun/lib/rindexed"

import {getRulesForPath, decryptByRule} from "./gunRulesHelper.js"
require('gun/lib/unset.js')
// let knownGunServer = ["http://localhost:1337/gun", "https://gun-manhattan.herokuapp.com/gun"]
// let knownGunServer = ["https://gun-manhattan.herokuapp.com/gun"]

export const gun = GUN(["https://gun.nilsr.me/gun", "https://gun-manhattan.herokuapp.com/gun"]);

const gunHelper = (function() {
  let APP_KEY = ""
  const listenerMap = new Map();
  const changeOnlyListenerMap = new Map();

  let rules = {};

  return { // public interface
    gun,
    get listenerMap(){ return {changeOnlyListenerMap, listenerMap} },
    get appKey(){
      return APP_KEY;
    },
    set appKey(key){
      if(!APP_KEY) APP_KEY = key
      else throw new Error("[GUN_HELPER] appKey can only be set once")
    },
    set rules(newRules){
      rules = newRules
    },
    get rules(){
      return rules;
    },
    cleanPath: (path) => path[path.length-1] == "/" ? path.substr(0,path.length-1) : path,
    getNodeByPath: (path) => {
      let pathSplit = gunHelper.cleanPath(path).split("/").filter(s => !!s.length)
      let isUserRoot = pathSplit[0] == "_user";
      let isPublicRoot = pathSplit[0] == "_public";
      let hasRoot = ["_user","_public"].includes(pathSplit[0])

      let node = isUserRoot ?  gunHelper.userAppRoot() : isPublicRoot ? gunHelper.publicAppRoot() : gun;
      for (let index = hasRoot ? 1 : 0; index < pathSplit.length; index++) {
        if(pathSplit[index] == "_back") node = node.back();
        else node = node.get(pathSplit[index]) 
      }
      return node;
    },
    on: function (path, listener, changeOnly) {
      let cleanPath = gunHelper.cleanPath(path)
      let map = !changeOnly ? listenerMap : changeOnlyListenerMap;
      //Get Current Listeners for path
      let listeners = map.get(cleanPath) || []
      let isNewPath = !listeners.length;
      //Add New Listener
      map.set(cleanPath, [...listeners, listener])

      gunHelper.onceAsync(cleanPath).then(val => {
        listener(val)
      })

      
      if(isNewPath){
        let rule = getRulesForPath(cleanPath)
        gunHelper.getNodeByPath(cleanPath).on((value, key, _msg, _ev) => {
          decryptByRule(rule, value).then((val) => {
            listenerMap.get(cleanPath).forEach(l => l(val, key, _msg, _ev))
          })
        }, changeOnly ? {change: changeOnly} : undefined)
      }
    },
    onceAsync: (keyPath, maxRequestTime = 5000) => new Promise(res => {
      let path  = gunHelper.cleanPath(keyPath);
      let cancleInterval = null;

      let node = gunHelper.getNodeByPath(path)
      node.once(( data, key, _msg, _ev ) => {
        if(cancleInterval) clearInterval(cancleInterval);
        let rule = getRulesForPath(path);
        decryptByRule(rule, data).then(res)
      })
      cancleInterval = setInterval(() => {
        clearInterval(cancleInterval)
        res({err:`Could not fetch ${path}(0)`, errData:[path]})
      }, maxRequestTime)
    }),
    off: function (path, listener) {
      let cleanPath = gunHelper.cleanPath(path)
      //Get Current Listeners for path
      let listeners = listenerMap.get(cleanPath) || []
      let changeOnlyListeners = changeOnlyListenerMap.get(cleanPath) || []
      if(!listeners.length && !changeOnlyListeners.length) return;

      let newList = listeners.filter((l) => l != listener)
      let newListChange = changeOnlyListeners.filter((l) => l != listener)

      listenerMap.set(cleanPath, newList)
      changeOnlyListenerMap.set(cleanPath, newListChange)

      let isLastListener = !newList.length;
      let isLastListenerChange = !newListChange.length;

      //TODO Probably better to add _ev to the map and remove the listeners individually if possible
      if(isLastListener && isLastListenerChange) gunHelper.getNodeByPath(cleanPath).off(); 
    },
    publicAppRoot: () => {
      if (!APP_KEY) throw new Error("[GUN_HELPER] App key is not set yet. Run gunHelper.appKey = KEY first.")
      return gun.get(APP_KEY)
    },
    userAppRoot: () => {
      if (!APP_KEY) throw new Error("[GUN_HELPER] App key is not set yet. Run gunHelper.appKey = KEY first.")
      return gun.user().get(APP_KEY)
    },

    encryptUser: async (data) => {
      let keyPair = gun.user()._.sea
      return await SEA.encrypt(data, keyPair)
    },
    decryptUser: async (data) => {
      let keyPair = gun.user()._.sea
      if(!( data + "" ).startsWith("SEA")) return data
      return await SEA.decrypt(data, keyPair)
    },

    trashNode: (node) => new Promise(res => {
      gun.user().get("trash").set(node)
      node.put(null)
    }),
    getUserKey: async (alias) => {
      if (!alias) return {err: "no alias set"};
      let userKeyData = {...(await gunHelper.onceAsync(`~@${alias}`) || {})}
      delete userKeyData["_"];
      let key = ( Object.keys(userKeyData) )[0]
      if (!key) return {err: "user does not exist"};
      return key;
    },
    load: async (path, cb, opt) => {
      let load = async (path, decrypt = true) => {
        let node = gunHelper.getNodeByPath(path);
        return await new Promise((res, rej) => {
          node.load(async data => {

            //Load sometimes doesn't correcntly load children the part below ensures that everything is loaded correctly
            let isObj = !!data && typeof data === 'object' &&  !Array.isArray(data)
            if(isObj){
              let entries = Object.entries(data);
              for (let i = 0; i < entries.length; i++) {
                const [key, val] = entries[i];
                if (!!val && typeof val === 'object' &&  !Array.isArray(val) && !Object.keys(val).length){
                  data[key] = await load(`${path}/${key}`, false);
                }
              }
            }

            //Decrypt data when all subparts are loaded
            if(data && decrypt) {
              let rule = getRulesForPath(path);

              decryptByRule(rule, { ...data }, path, { ...data }).then(result => {
                cb && cb(result)
                res(result)
              })
            }
            else res(data)
          })
        })
      }

      return load(gunHelper.cleanPath(path)) 
    }
  };
})();

export default gunHelper

window.gun = gun;
window.gunHelper = gunHelper;