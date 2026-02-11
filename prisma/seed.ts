import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 Cleaning existing data...");
    await prisma.rewardRedemption.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.collectorRoute.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.analytics.deleteMany();
    await prisma.systemSettings.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create Admin User
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ecowaste.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
      zone: "Zone A",
      points: 0,
    },
  });

  // Create Collector Users
  console.log("🚛 Creating collector users...");
  const collector1 = await prisma.user.create({
    data: {
      email: "collector1@ecowaste.com",
      name: "John Collector",
      password: await bcrypt.hash("collector123", 10),
      role: "collector",
      zone: "Zone A",
      phone: "555-0101",
      points: 0,
    },
  });

  const collector2 = await prisma.user.create({
    data: {
      email: "collector2@ecowaste.com",
      name: "Jane Collector",
      password: await bcrypt.hash("collector123", 10),
      role: "collector",
      zone: "Zone B",
      phone: "555-0102",
      points: 0,
    },
  });

  // Create Regular Users
  console.log("👥 Creating regular users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "user1@example.com",
        name: "Alice Johnson",
        password: await bcrypt.hash("user123", 10),
        role: "user",
        zone: "Zone A",
        address: "123 Green Street, Eco City",
        phone: "555-0201",
        points: 150,
      },
    }),
    prisma.user.create({
      data: {
        email: "user2@example.com",
        name: "Bob Smith",
        password: await bcrypt.hash("user123", 10),
        role: "user",
        zone: "Zone B",
        address: "456 Recycle Ave, Eco City",
        phone: "555-0202",
        points: 200,
      },
    }),
  ]);

  // Create Collection Schedules
  console.log("📅 Creating collection schedules...");
  const schedules = await Promise.all([
    prisma.schedule.create({
      data: {
        zone: "Zone A",
        dayOfWeek: 1, // Monday
        timeSlot: "08:00-12:00",
        wasteType: "general",
        collectorId: collector1.id,
      },
    }),
    prisma.schedule.create({
      data: {
        zone: "Zone A",
        dayOfWeek: 3, // Wednesday
        timeSlot: "08:00-12:00",
        wasteType: "recycling",
        collectorId: collector1.id,
      },
    }),
    prisma.schedule.create({
      data: {
        zone: "Zone A",
        dayOfWeek: 5, // Friday
        timeSlot: "08:00-12:00",
        wasteType: "organic",
        collectorId: collector1.id,
      },
    }),
    prisma.schedule.create({
      data: {
        zone: "Zone B",
        dayOfWeek: 2, // Tuesday
        timeSlot: "13:00-17:00",
        wasteType: "general",
        collectorId: collector2.id,
      },
    }),
    prisma.schedule.create({
      data: {
        zone: "Zone B",
        dayOfWeek: 4, // Thursday
        timeSlot: "13:00-17:00",
        wasteType: "recycling",
        collectorId: collector2.id,
      },
    }),
  ]);

  // Create Rewards
  console.log("🎁 Creating rewards...");
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: "Coffee Shop Voucher",
        description: "$5 off at participating coffee shops",
        pointsCost: 100,
        category: "voucher",
        imageUrl: "/rewards/coffee.png",
      },
    }),
    prisma.reward.create({
      data: {
        name: "Cinema Ticket Discount",
        description: "20% off movie tickets",
        pointsCost: 150,
        category: "discount",
        imageUrl: "/rewards/cinema.png",
      },
    }),
    prisma.reward.create({
      data: {
        name: "Reusable Shopping Bag",
        description: "Eco-friendly shopping bag",
        pointsCost: 75,
        category: "service",
        imageUrl: "/rewards/bag.png",
      },
    }),
    prisma.reward.create({
      data: {
        name: "Plant a Tree",
        description: "We will plant a tree in your name",
        pointsCost: 200,
        category: "service",
        imageUrl: "/rewards/tree.png",
      },
    }),
    prisma.reward.create({
      data: {
        name: "Restaurant Voucher",
        description: "$10 off at eco-friendly restaurants",
        pointsCost: 180,
        category: "voucher",
        imageUrl: "/rewards/restaurant.png",
      },
    }),
  ]);

  // Create Sample Collections
  console.log("♻️ Creating sample collections...");
  const now = new Date();
  const collections = await Promise.all([
    prisma.collection.create({
      data: {
        userId: users[0].id,
        wasteType: "recycling",
        address: users[0].address!,
        zone: users[0].zone!,
        status: "completed",
        priority: "normal",
        notes: "Mostly paper and cardboard - 2 bags",
        scheduledDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        collectorId: collector1.id,
      },
    }),
    prisma.collection.create({
      data: {
        userId: users[1].id,
        wasteType: "organic",
        address: users[1].address!,
        zone: users[1].zone!,
        status: "in_progress",
        priority: "normal",
        notes: "1 bin",
        scheduledDate: now,
        collectorId: collector2.id,
      },
    }),
    prisma.collection.create({
      data: {
        userId: users[0].id,
        wasteType: "hazardous",
        address: users[0].address!,
        zone: users[0].zone!,
        status: "pending",
        priority: "high",
        notes: "Old batteries and paint cans - 1 small box",
        scheduledDate: now,
      },
    }),
  ]);

  // Create Sample Reports
  console.log("📝 Creating sample reports...");
  const reports = await Promise.all([
    prisma.report.create({
      data: {
        userId: users[0].id,
        type: "missed_collection",
        title: "Missed Collection on Monday",
        description: "Scheduled collection on Monday was missed",
        location: users[0].address!,
        status: "resolved",
        priority: "high",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        resolvedBy: adminUser.id,
        resolutionNotes: "Collection rescheduled and completed",
      },
    }),
    prisma.report.create({
      data: {
        userId: users[1].id,
        type: "illegal_dumping",
        title: "Illegal Dumping Report",
        description: "Waste dumped on the corner of Main St",
        location: "Main St & 5th Ave",
        status: "pending",
        priority: "high",
      },
    }),
  ]);

  // Create Sample Notifications
  console.log("🔔 Creating sample notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "collection_reminder",
        title: "Collection Scheduled",
        message: "Your waste collection has been scheduled for tomorrow",
        link: `/collections/${collections[0].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: "issue_report",
        title: "Report Update",
        message: "Your report has been reviewed by our team",
        link: `/reports/${reports[1].id}`,
        isRead: false,
      },
    }),
  ]);

  // Create Analytics Records
  console.log("📊 Creating analytics records...");
  await prisma.analytics.create({
    data: {
      totalCollections: collections.length,
      completedCollections: 1,
      recyclingWeight: 30.0,
      generalWasteWeight: 5.5,
      co2Saved: 15.5,
      date: now,
    },
  });

  // Create System Settings
  console.log("⚙️ Creating system settings...");
  await prisma.systemSettings.create({
    data: {
      key: "points_per_collection",
      value: "10",
      category: "rewards",
    },
  });

  await prisma.systemSettings.create({
    data: {
      key: "points_per_report",
      value: "5",
      category: "rewards",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Users created: ${await prisma.user.count()}`);
  console.log(`  - Schedules created: ${await prisma.schedule.count()}`);
  console.log(`  - Rewards created: ${await prisma.reward.count()}`);
  console.log(`  - Collections created: ${await prisma.collection.count()}`);
  console.log(`  - Reports created: ${await prisma.report.count()}`);
  console.log(
    `  - Notifications created: ${await prisma.notification.count()}`
  );
  console.log("\n👤 Test Accounts:");
  console.log("  Admin: admin@ecowaste.com / admin123");
  console.log("  Collector: collector1@ecowaste.com / collector123");
  console.log("  User: user1@example.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
