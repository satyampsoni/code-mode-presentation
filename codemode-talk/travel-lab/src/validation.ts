import { expectedOptions,flightById } from './dataset.js';
import { MAIN_PROMPT,type RunTrace } from './types.js';
/** Validate only the known conference prompt. Other natural-language prompts retain their own meaning. */
export function mainResultError(trace:RunTrace):string|undefined{
 if(trace.status!=='complete'||trace.prompt.trim()!==MAIN_PROMPT)return;
 const answer=trace.answer as {options?:{id?:string;flightId?:string;price?:number;checkedKg?:number}[]};
 const options=answer?.options;
 if(!Array.isArray(options)||JSON.stringify(options.map(f=>f.id||f.flightId))!==JSON.stringify(expectedOptions))return `Result validation failed: expected available flights ${expectedOptions.join(', ')} in fare order. The model's answer has been retained for inspection; no recording was saved.`;
 for(const option of options){const f=flightById((option.id||option.flightId)!);if(option.price!==f.price||option.checkedKg!==f.checkedKg)return `Result validation failed: price or baggage for ${f.id} differs from the deterministic tool data. No recording was saved.`;}
}
