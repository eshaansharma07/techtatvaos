const entries=new Map<string,{count:number;reset:number}>();
export function rateLimit(key:string,limit=30,windowMs=60_000){const now=Date.now();const hit=entries.get(key);if(!hit||hit.reset<now){entries.set(key,{count:1,reset:now+windowMs});return true}if(hit.count>=limit)return false;hit.count++;return true}
