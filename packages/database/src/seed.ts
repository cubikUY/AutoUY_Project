import { prisma } from "./index";
import bcrypt from "bcryptjs";

/**
 * Seed inicial de la base de datos.
 * Crea usuarios de prueba con contraseñas seguras.
 *
 * Uso: pnpm --filter @autouuy/database run db:seed
 */
async function main() {
  console.log("Seeding database...");

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const dealerPassword = await bcrypt.hash("dealer123", salt);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@autouuy.uy" },
    update: { passwordHash: adminPassword },
    create: {
      email: "admin@autouuy.uy",
      name: "Admin Principal",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  // 2. Common Brands in Uruguay
  const brandsData = [
    { name: "Toyota", models: ["Corolla", "Hilux", "Yaris", "Etios"] },
    { name: "Volkswagen", models: ["Gol", "Amarok", "Up!", "T-Cross", "Polo"] },
    { name: "Chevrolet", models: ["Onix", "S10", "Cruze", "Tracker", "Joy"] },
    { name: "Fiat", models: ["Strada", "Cronos", "Argo", "Mobi", "Toro"] },
    { name: "Suzuki", models: ["Swift", "Alto", "Celerio", "Vitara", "Jimny"] },
    { name: "Hyundai", models: ["HB20", "Creta", "Tucson"] },
    { name: "Renault", models: ["Kwid", "Oroch", "Duster", "Sandero"] },
    { name: "Peugeot", models: ["208", "3008", "Partner"] },
  ];

  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { name: b.name },
      update: {},
      create: { name: b.name },
    });

    for (const m of b.models) {
      await prisma.model.upsert({
        where: { name_brandId: { name: m, brandId: brand.id } },
        update: {},
        create: { name: m, brandId: brand.id },
      });
    }
  }

  // 3. Dealer Principal
  const dealer = await prisma.user.upsert({
    where: { email: "dealer@test.com" },
    update: { passwordHash: dealerPassword },
    create: {
      email: "dealer@test.com",
      name: "Automotora VIP",
      passwordHash: dealerPassword,
      role: "DEALER",
    },
  });

  const profile = await prisma.dealerProfile.upsert({
    where: { ownerId: dealer.id },
    update: {},
    create: {
      ownerId: dealer.id,
      businessName: "AutoUY Official Dealer",
      city: "Montevideo",
      phone: "099123456",
      verified: true,
    },
  });

  // 4. Sample Vehicle
  const toyota = await prisma.brand.findUnique({ where: { name: "Toyota" } });
  const corolla = await prisma.model.findFirst({ where: { brandId: toyota?.id, name: "Corolla" } });

  if (toyota && corolla) {
    await prisma.vehicle.create({
      data: {
        title: "Toyota Corolla GLI 2024 - Oportunidad",
        description: "Impecable estado, único dueño.",
        vehicleType: "AUTO",
        condition: "USED",
        status: "ACTIVE",
        brandId: toyota.id,
        modelId: corolla.id,
        year: 2024,
        mileage: 5000,
        price: 32000,
        currency: "USD",
        ownerId: dealer.id,
        dealerId: profile.id,
      },
    });
  }

  console.log("Seed complete! 🌱");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
