import { prisma } from "./index";

async function seedFeatured() {
  const brands = ["Toyota", "Fiat", "Suzuki", "Volkswagen", "Chevrolet"];
  for (const name of brands) {
    await prisma.brand.update({
      where: { name },
      data: { isFeatured: true },
    }).catch(() => null);
  }
  console.log("Featured brands seeded!");
  process.exit(0);
}

seedFeatured();
