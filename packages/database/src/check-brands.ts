import { prisma } from "./index";

async function check() {
  const brands = await prisma.brand.findMany();
  console.log(JSON.stringify(brands, null, 2));
  process.exit(0);
}

check();
