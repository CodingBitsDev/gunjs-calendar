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

require('gun/lib/unset.js')
// let knownGunServer = ["http://localhost:1337/gun", "https://gun-manhattan.herokuapp.com/gun"]
// let knownGunServer = ["https://gun-manhattan.herokuapp.com/gun"]

export const gun = GUN(["https://gun.nilsr.me/gun"]);

const gunHelper = (function() {

  let APP_KEY = ""
  const listenerMap = new Map();
  const changeOnlyListenerMap = new Map();

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

    on: function (path, listener, changeOnly) {
      let map = !changeOnly ? listenerMap : changeOnlyListenerMap;
      //Get Current Listeners for path
      let listeners = map.get(path) || []
      let isNewPath = !listeners.length;
      //Add New Listener
      map.set(path, [...listeners, listener])

      let node = gunHelper.getNodeByPath(path);
      node.once((value) => {listener(value)})

      if(isNewPath){
        node.on((value, key, _msg, _ev) => {
          listenerMap.get(path).forEach(l => l(value, key, _msg, _ev))
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
      let pathSplit = path.split("/")
      let isUserRoot = pathSplit[0] == "user";
      let isPublicRoot = pathSplit[0] == "public";
      let node = isUserRoot ?  gunHelper.userAppRoot() : isPublicRoot ? gunHelper.publicAppRoot() : gun;
      for (let index = isUserRoot ? 1 : 0; index < pathSplit.length; index++) {
        node = node.get(pathSplit[index]) 
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
    onceAsync: (keyPath, startNode, maxRequestTime = 5000) => new Promise(res => {
      let cancleInterval = null;
      let keys = ( keyPath || "" ).split(".");

      let node 
      if (!keyPath && !startNode) res(undefined);
      if(startNode) {
        node = startNode;
        for (let i = 0; i < keys.length; i++) {
            node = node.get(keys[i])
        }
      } else {
        node = gunHelper.getNodeByPath(keyPath)
      }
      node.once(( data, key, _msg, _ev ) => {
        if(cancleInterval) clearInterval(cancleInterval);
        res(data)
      })
      cancleInterval = setInterval(() => {
        clearImmediate(cancleInterval)
        res({err:`Could not fetch ${keyPath}(0) from ${startNode}(1)`, errData:[keyPath, startNode]})
      }, maxRequestTime)
    }),

    getUserInfo: (alias) => {
        return new Promise(async resolve => {
            if (!alias) return resolve([ undefined, undefined ]);
            let userKeyData = {...(await gunHelper.onceAsync(`~@${alias}`) || {})}
            delete userKeyData["_"];
            let key = ( Object.keys(userKeyData) )[0]
            if (!key) return resolve([ undefined, undefined ]);
            let userData = gun.get(key);
            resolve(userData)
        })
    }
  };
})();

export default gunHelper

window.gun = gun;
window.gunHelper = gunHelper;