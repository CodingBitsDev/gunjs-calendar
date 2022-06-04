import { SEA } from "gun";
import gunHelper from "./gunHelper";

export function getRulesForPath (path){
  let rules = gunHelper.rules;
  let rulesPart = rules;
  let pathSplit = path.split("/").filter(Boolean)
  let wildCards = new Map();
  for (let i = 0; i < pathSplit.length; i++) {
    if(!rulesPart) break;
    let rule = rulesPart[pathSplit[i]];
    if(rule){ 
      rulesPart = { ...rule };
      continue
    }
    let restRules = Object.entries(rulesPart).filter(([key, val]) => key.startsWith("$"))
    if(restRules.length > 1) throw new Error(`[GUN-HELPER] The rule "${pathSplit[i-1] || "ROOT"}" has more than one wildcard.`)
    if(!restRules.length){ 
      rulesPart = null; 
      continue;
    }
    wildCards.set(restRules[0][0].replace("$", ""),pathSplit[i])
    rulesPart = restRules[0][1];
  }
  
  let returnRules = {}
  Object.entries(rulesPart || {}).forEach(([key, val]) => {
    if(typeof val === 'string' || val instanceof String){
      let returnString =  val;
      wildCards.forEach(( sub, id ) => {
        if(returnString.includes(`{${id}}`)) returnString = returnString.replaceAll(`{${ id }}`, sub);
      })
      returnRules[key] = returnString;
    } else {
      returnRules[key] = val;
    }
    return undefined
  })
  returnRules.path = path;

  return returnRules; 
}

export async function decryptByRule(rule, data, parentPath, parentData, subPath = ""){
  if(rule.type == "encUser"){
    return await gunHelper.decryptUser(data)
  } else if ( rule.type == "enc"){
    let key = null;
    let keyPath = rule.keyPair || rule.key;
    if(parentPath && parentData && keyPath.startsWith(parentPath)){
      let path = parentPath.replace(parentPath);
      if (path.startsWith("/")) path = path.substring(1);
      let split = path.split("/").filter(Boolean);

      let updateKeyData = () => {}
      let keyData = parentData;
      let keyDataFound = !split.some((key) => {
        if(!keyData) {
          updateKeyData = (val) => keyData[key] = val;
          keyData = keyData?.[key]
        }
        else return false;
      }) 
      if(keyDataFound && keyData){
        if(keyData?.startsWith("SEA")){
          let rule = getRulesForPath(path)
          keyData = await decryptByRule(rule, keyData, parentPath, parentData)
          updateKeyData(keyData)
        }
      }
      key = keyData || await gunHelper.onceAsync(keyPath);
    } else {
      key = await gunHelper.onceAsync(keyPath)
    }
    return await SEA.decrypt(data, key)
  }

  let dataIsObject = typeof data === 'object' && data !== null

  if(dataIsObject && parentData && parentPath){
    let entries = !Array.isArray(data) ? Object.entries(data || {}) : data;
    let dataCopy = {}
    let dataPromises = []
    for (let i = 0; i < entries.length; i++) {
      let key = entries[i][0]
      let value = entries[i][1]
      let keyPath = `${subPath || parentPath}/${key}`
      let isObj = typeof value === 'object' && value !== null && !Array.isArray(value)
      console.log("### res", subPath, keyPath, key, isObj, isObj && entries[i])
      // let subRule = getRulesForPath(keyPath)
      // dataPromises.push(new Promise(async res => {
      //   dataCopy[key] = await decryptByRule(subRule, value, parentPath, parentData, keyPath)
      //   res();
      // }))
    }
    await Promise.all(dataPromises);
    return { ...dataCopy };
  }

  return data;
}