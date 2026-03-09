const { PrismaClient, Role } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const factory = await prisma.factory.create({
    data: {
      name: "AnkismaikT Steel Unit",
      location: "Kota"
    }
  })

  await prisma.inventory.create({
    data: {
      factoryId: factory.id,
      rawStock: 100,
      finishedStock: 0
    }
  })

  await prisma.user.create({
    data: {
      name: "Pradeep Kishan",
      email: "pradeep@test.com",
      password: "123456",
      role: Role.OWNER,
      factoryId: factory.id
    }
  })

  console.log("✅ Seed completed")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
