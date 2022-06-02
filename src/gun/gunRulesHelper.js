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
      rulesPart = rule;
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
    }
    return undefined
  })
  returnRules.path = path;

  return returnRules; 
}

export async function decryptByRule(rule, data){
  if(rule.type == "encUser"){
    return await gunHelper.decryptUser(data)
  } else if ( rule.type == "enc"){
    let keyPath = rule.keyPair || rule.key;
    let key = await gunHelper.onceAsync(keyPath)
    return await SEA.decrypt(data, key)
  }
  return data;
}