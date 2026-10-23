/// <reference lib="webworker" />
let pyodide:any=null;let loading:Promise<any>|null=null;
async function init(){if(pyodide)return pyodide;if(!loading)loading=(async()=>{const module=await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs');pyodide=await module.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});postMessage({type:'ready'});return pyodide})();return loading}
init().catch(err=>postMessage({type:'result',output:'Unable to load Python runtime: '+String(err)}));
self.onmessage=async(event:MessageEvent)=>{if(event.data.type!=='run')return;try{const py=await init();let stdout='';let stderr='';py.setStdout({batched:(s:string)=>{stdout+=s+'\n'}});py.setStderr({batched:(s:string)=>{stderr+=s+'\n'}});await py.runPythonAsync(event.data.code);postMessage({type:'result',output:stdout+stderr||'(Program finished with no output)'})}catch(err){postMessage({type:'result',output:String(err)})}};
