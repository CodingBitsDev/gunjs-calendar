import { SEA } from "gun";
import gunHelper from "./gunHelper";

export function getRulesForPath (rules, path){
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

export async function decryptByRule(rule, data, parentPath, parentData, rules){
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
          let rule = getRulesForPath(rules, path)
          keyData = await decryptByRule(rule, keyData, parentPath, parentData, rules)
          updateKeyData(keyData)
        }
      }
      key = keyData || await gunHelper.onceAsync(keyPath);
    } else key = await gunHelper.onceAsync(keyPath)
    return await SEA.decrypt(data, key)
  }
  return data;
}