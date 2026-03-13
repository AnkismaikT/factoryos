import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function ProductionPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let factoryId;

  try {

    const decoded: any = verifyToken(token);
    factoryId = decoded.factoryId;

  } catch {

    redirect("/login");

  }

  /* ===============================
     FETCH PRODUCTION RECORDS
  =============================== */

  const productions = await prisma.production.findMany({

    where: { factoryId },

    orderBy: { date: "desc" }

  });

  return (

<div className="min-h-screen bg-gray-950 text-white p-8">

<h1 className="text-3xl font-bold mb-8">

Production History

</h1>

<div className="bg-gray-900 rounded-2xl shadow-lg overflow-x-auto">

<table className="w-full text-left">

<thead className="bg-gray-800">

<tr>

<th className="p-4">Date</th>
<th className="p-4">Raw Input</th>
<th className="p-4">Output</th>
<th className="p-4">Waste</th>
<th className="p-4">Yield %</th>
<th className="p-4">Total Cost</th>
<th className="p-4">Remaining</th>

</tr>

</thead>

<tbody>

{productions.map((p:any)=>{

const date = new Date(p.date).toLocaleDateString();

return(

<tr key={p.id} className="border-t border-gray-800">

<td className="p-4">{date}</td>

<td className="p-4">{p.rawInput}</td>

<td className="p-4">{p.output}</td>

<td className="p-4">{p.waste}</td>

<td className="p-4">{p.yield}%</td>

<td className="p-4">₹ {p.totalCost?.toLocaleString()}</td>

<td className="p-4">{p.remainingQuantity}</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

  );

}
