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

gun.getValAsync = (keyPath, startNode) => new Promise(res => {
    let keys = ( keyPath || "" ).split(".");

    let node 
    if (!keyPath && !startNode) return res(undefined);
    else if (!keyPath && startNode) node = startNode;
    else {
        node = (startNode || gun).get(keys[0])
    }
    keys = keys.splice(1)
    keys.forEach(key => {
        node = node.get(key)
    })
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

export default gun; 
export const APP_KEY = "gun-calendar"

window.gun = gun;