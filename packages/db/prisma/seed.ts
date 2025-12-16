

import "dotenv/config";
import { AdjustmentType, CourtType, PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please set it in the environment or in packages/db/.env");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting Database Seed...");

  await prisma.bookingEquipment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.court.deleteMany();
  await prisma.user.deleteMany();

  const user1 = await prisma.user.create({
    data: {
      email: "player@example.com",
      name: "John Player",
      password: "hashedpassword123", 
      role: Role.USER,
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      email: "admin@badminton.com",
      name: "Admin User",
      password: "hashedpassword123",
      role: Role.ADMIN,
    },
  });

  console.log("Users created");

  await prisma.court.createMany({
    data: [
      { name: "Court 1 (Indoor)", type: CourtType.INDOOR, basePrice: 800 },
      { name: "Court 2 (Indoor)", type: CourtType.INDOOR, basePrice: 800 },
      { name: "Court 3 (Outdoor)", type: CourtType.OUTDOOR, basePrice: 500 },
      { name: "Court 4 (Outdoor)", type: CourtType.OUTDOOR, basePrice: 500 },
    ],
  });
  console.log("Courts created");

  await prisma.coach.createMany({
    data: [
      { name: "Coach Mike", bio: "Pro level expert", hourlyRate: 300 },
      { name: "Coach Sarah", bio: "Focus on agility", hourlyRate: 250 },
      { name: "Coach David", bio: "Beginner specialist", hourlyRate: 200 },
    ],
  });
  console.log("Coaches created");

  await prisma.equipment.createMany({
    data: [
      { name: "Yonex Pro Racket", totalStock: 10, price: 100 },
      { name: "Standard Racket", totalStock: 20, price: 50 },
      { name: "Non-Marking Shoes (Size 9)", totalStock: 5, price: 80 },
      { name: "Non-Marking Shoes (Size 10)", totalStock: 5, price: 80 },
    ],
  });
  console.log("Equipment created");


  
  // Rule A: Weekend Surge (Saturday/Sunday) -> +20%
  await prisma.pricingRule.create({
    data: {
      name: "Weekend Surge",
      daysOfWeek: [0, 6], // Sunday, Saturday
      adjustmentType: AdjustmentType.PERCENTAGE,
      amount: 20.0,
      priority: 1,
    },
  });

  // Rule B: Peak Hours (6 PM - 9 PM) -> Flat +150
  await prisma.pricingRule.create({
    data: {
      name: "Evening Peak Hours",
      startTime: "18:00",
      endTime: "21:00",
      daysOfWeek: [], // All days
      adjustmentType: AdjustmentType.FLAT,
      amount: 150.0,
      priority: 2,
    },
  });

  console.log("Pricing Rules created");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });