"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDispatch() {

const router = useRouter();

const [customer,setCustomer] = useState("");
const [quantity,setQuantity] = useState("");
const [sellingPrice,setSellingPrice] = useState("");
const [productionId,setProductionId] = useState("");

async function submit(e:any){

e.preventDefault();

const res = await fetch("/api/dispatch/create",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
customer,
quantity:Number(quantity),
sellingPrice:Number(sellingPrice),
productionId
})
});

if(res.ok){
alert("Dispatch recorded");
router.push("/dashboard");
}else{
alert("Error saving dispatch");
}

}

return(

<div className="min-h-screen bg-gray-950 text-white p-8">

<h1 className="text-3xl font-bold mb-8">
New Dispatch
</h1>

<form onSubmit={submit} className="space-y-6 max-w-xl">

<input
placeholder="Customer Name"
value={customer}
onChange={(e)=>setCustomer(e.target.value)}
className="w-full p-3 rounded bg-gray-800"
/>

<input
placeholder="Quantity"
value={quantity}
onChange={(e)=>setQuantity(e.target.value)}
className="w-full p-3 rounded bg-gray-800"
/>

<input
placeholder="Selling Price"
value={sellingPrice}
onChange={(e)=>setSellingPrice(e.target.value)}
className="w-full p-3 rounded bg-gray-800"
/>

<input
placeholder="Production ID"
value={productionId}
onChange={(e)=>setProductionId(e.target.value)}
className="w-full p-3 rounded bg-gray-800"
/>

<button className="bg-blue-600 px-6 py-3 rounded">
Save Dispatch
</button>

</form>

</div>

);

}
