import { prisma } from "@/lib/prisma";

export async function updateInventoryAfterProduction(
  factoryId: string,
  rawInput: number,
  output: number
) {
  const inventory = await prisma.inventory.findUnique({
    where: { factoryId },
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  if (inventory.rawStock < rawInput) {
    throw new Error("Insufficient raw stock");
  }

  await prisma.inventory.update({
    where: { factoryId },
    data: {
      rawStock: inventory.rawStock - rawInput,
      finishedStock: inventory.finishedStock + output,
    },
  });
}

