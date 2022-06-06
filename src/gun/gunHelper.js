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

export const gun = GUN(["https://gun.nilsr.me/gun"]);

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
    on: function (path, listener, changeOnly) {
      let map = !changeOnly ? listenerMap : changeOnlyListenerMap;
      //Get Current Listeners for path
      let listeners = map.get(path) || []
      let isNewPath = !listeners.length;
      //Add New Listener
      map.set(path, [...listeners, listener])

      gunHelper.onceAsync(path).then(val => {
        listener(val)
      })

      
      if(isNewPath){
        let rule = getRulesForPath(path)
        gunHelper.getNodeByPath(path).on((value, key, _msg, _ev) => {
          decryptByRule(rule, value).then((val) => {
            listenerMap.get(path).forEach(l => l(val, key, _msg, _ev))
          })
        }, changeOnly ? {change: changeOnly} : undefined)
      }
    },
    off: function (path, listener) {
      //Get Current Listeners for path
      let listeners = listenerMap.get(path) || []
      let changeOnlyListeners = changeOnlyListenerMap.get(path) || []
      if(!listeners.length && !changeOnlyListeners.length) return;

      let newList = listeners.filter((l) => l != listener)
      let newListChange = changeOnlyListeners.filter((l) => l != listener)

      listenerMap.set(path, newList)
      changeOnlyListenerMap.set(path, newListChange)

      let isLastListener = !newList.length;
      let isLastListenerChange = !newListChange.length;

      //TODO Probably better to add _ev to the map and remove the listeners individually if possible
      if(isLastListener && isLastListenerChange) gunHelper.getNodeByPath(path).off(); 
    },

    getNodeByPath: (path) => {
      let pathSplit = path.split("/").filter(s => !!s.length)
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
    userAppRoot: () => {
      if (!APP_KEY) throw new Error("[GUN_HELPER] App key is not set yet. Run gunHelper.appKey = KEY first.")
      return gun.user().get(APP_KEY)
    },
    publicAppRoot: () => {
      if (!APP_KEY) throw new Error("[GUN_HELPER] App key is not set yet. Run gunHelper.appKey = KEY first.")
      return gun.get(APP_KEY)
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
    onceAsync: (keyPath, maxRequestTime = 5000) => new Promise(res => {
      let cancleInterval = null;

      let node = gunHelper.getNodeByPath(keyPath)
      node.once(( data, key, _msg, _ev ) => {
        if(cancleInterval) clearInterval(cancleInterval);
        let rule = getRulesForPath(keyPath);
        decryptByRule(rule, data).then(res)
      })
      cancleInterval = setInterval(() => {
        clearInterval(cancleInterval)
        res({err:`Could not fetch ${keyPath}(0)`, errData:[keyPath]})
      }, maxRequestTime)
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
      let cleanPath = path[path.length-1] == "/" ? path.substr(0,path.length-1) : path

      let load = async (path, decrypt = true) => {
        let node = gunHelper.getNodeByPath(path);
        return await new Promise((res, rej) => {
          node.load(async data => {
            let isObj = !!data && typeof data === 'object' &&  !Array.isArray(data)
            if(isObj){
              let entries = Object.entries(data);
              for (let i = 0; i < entries.length; i++) {
                const [key, val] = entries[i];
                if (!!val && typeof val === 'object' &&  !Array.isArray(val)){
                  data[key] = await load(`${path}/${key}`, false);
                }
              }
            }
            if(data && decrypt) {
              let rule = getRulesForPath(cleanPath);

              decryptByRule(rule, { ...data }, cleanPath, { ...data }).then(result => {
                cb && cb(result)
                res(result)
              })
            }
            else res(data)
          })
        })
      }
      return load(path) 
    }
  };
})();

export default gunHelper

window.gun = gun;
window.gunHelper = gunHelper;