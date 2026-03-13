"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProduction() {

const router = useRouter();

const [form,setForm] = useState({
rawInput:"",
output:"",
waste:"",
machine:"",
shift:"",
operator:"",
notes:""
});

async function handleSubmit(e:any){

e.preventDefault();

const res = await fetch("/api/production/create",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
});

if(res.ok){
alert("Production record saved");
router.push("/dashboard");
}else{
alert("Error saving record");
}

}

return(

<div className="min-h-screen bg-gray-950 text-white p-8">

<h1 className="text-3xl font-bold mb-8">
New Production Entry
</h1>

<form onSubmit={handleSubmit} className="space-y-6 max-w-xl">

<input
placeholder="Raw Input (tons)"
className="w-full p-3 rounded bg-gray-800"
value={form.rawInput}
onChange={(e)=>setForm({...form,rawInput:e.target.value})}
/>

<input
placeholder="Output Produced (tons)"
className="w-full p-3 rounded bg-gray-800"
value={form.output}
onChange={(e)=>setForm({...form,output:e.target.value})}
/>

<input
placeholder="Waste Generated (tons)"
className="w-full p-3 rounded bg-gray-800"
value={form.waste}
onChange={(e)=>setForm({...form,waste:e.target.value})}
/>

<input
placeholder="Machine"
className="w-full p-3 rounded bg-gray-800"
value={form.machine}
onChange={(e)=>setForm({...form,machine:e.target.value})}
/>

<input
placeholder="Shift"
className="w-full p-3 rounded bg-gray-800"
value={form.shift}
onChange={(e)=>setForm({...form,shift:e.target.value})}
/>

<input
placeholder="Operator"
className="w-full p-3 rounded bg-gray-800"
value={form.operator}
onChange={(e)=>setForm({...form,operator:e.target.value})}
/>

<textarea
placeholder="Notes"
className="w-full p-3 rounded bg-gray-800"
value={form.notes}
onChange={(e)=>setForm({...form,notes:e.target.value})}
/>

<button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded">

Save Production

</button>

</form>

</div>

);

}
