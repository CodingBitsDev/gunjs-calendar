import GUN from "gun/gun.js"
import SEA from "gun/sea"
import "gun/lib/yson.js";
import "gun/lib/dom.js"
import "gun/lib/upload.js"
import "gun/lib/radix"
import "gun/lib/radisk"
import "gun/lib/store"
import "gun/lib/rindexed"

require('gun/lib/unset.js')
// let knownGunServer = ["http://localhost:1337/gun", "https://gun-manhattan.herokuapp.com/gun"]
// let knownGunServer = ["https://gun-manhattan.herokuapp.com/gun"]
const gun = GUN(["https://gun.nilsr.me/gun"]);

gun.trashNode = (node) => new Promise(res => {
    gun.user().get("trash").set(node)
    node.put(null)
})
gun.userAppRoot = () => {
    return gun.user().get(APP_KEY)
}
gun.publicAppRoot = () => {
    return gun.get(APP_KEY)
}
gun.getNodeByPath = (path) => {
    let pathSplit = path.split(".")
    let isUserRoot = pathSplit[0] == "user";
    let isPublicRoot = pathSplit[0] == "public";
    let node = isUserRoot ?  gun.userAppRoot() : isPublicRoot ? gun.publicAppRoot() : gun;
    for (let index = isUserRoot ? 1 : 0; index < pathSplit.length; index++) {
        node = node.get(pathSplit[index]) 
    }
    return node;
}

gun.getValAsync = (keyPath, startNode) => new Promise(res => {
    let keys = ( keyPath || "" ).split(".");

    let node 
    if (!keyPath && !startNode) return res(undefined);
    if(startNode) {
        node = startNode;
        for (let i = 0; i < keys.length; i++) {
            node = node.get(keys[i])
        }
    } else {
        node = gun.getNodeByPath(keyPath)
    }
    node.once((data) => {
        return res(data)
    })
    setTimeout(() => {res({err:`Could not fetch ${keyPath}(0) from ${startNode}(1)`, errData:[keyPath, startNode]})},5000)
})

gun.getUser = (alias) => {
    return new Promise(async resolve => {
        if (!alias) return resolve([ undefined, undefined ]);
        let userKeyData = {...(await gun.getValAsync(`~@${alias}`) || {})}
        delete userKeyData["_"];
        let key = ( Object.keys(userKeyData) )[0]
        if (!key) return resolve([ undefined, undefined ]);
        let userData = gun.get(key);
        userData.once(data => {
            resolve([ data, key ])
        })
    })
}

//Better Listener handling since the off() function removes all listeners instead of just one
gun.listenerMap = new Map();
gun.valueMap = new Map();
gun.addListener = (path, listener) => {
    //Get Current Listeners for path
    let listenerList = gun.listenerMap.get(path) || []
    let isNewPath = !listenerList.length;
    //Add New Listener
    gun.listenerMap.set(path, [...listenerList, listener])
    if(isNewPath){
        gun.getNodeByPath(path).on((value, key, _msg, _ev) => {
            gun.valueMap.set(path, [value, key, _msg, _ev])
            gun.listenerMap.get(path).forEach(l => l(value, key, _msg, _ev))
        })
    } else {
        let currentVal = gun.valueMap.get(path)
        if(currentVal){
            listener(...currentVal)
        }
    }
}
gun.removeListener = (path, listener) => {
    //Get Current Listeners for path
    let listenerList = gun.listenerMap.get(path) || []
    let newList = listenerList.filter((l) => l != listener)
    gun.listenerMap.set(path, newList)
    let isLastListener = !newList.length;

    if(isLastListener){
        gun.getNodeByPath().off();
    } 
}


export default gun; 
export const APP_KEY = "gun-calendar"

window.gun = gun;