import { connectDB, University } from "../lib/db";

async function backfill() {
  await connectDB();
  const result = await University.updateMany(
    {
      $or: [
        { country: { $exists: false } },
        { country: "" },
        { countryCode: { $exists: false } },
        { countryCode: "" },
        { scholarshipType: { $exists: false } },
        { aliases: { $exists: false } },
        { featuredOnHome: { $exists: false } },
        { homeOrder: { $exists: false } },
      ],
    },
    [
      {
        $set: {
          country: { $ifNull: ["$country", "Türkiye"] },
          countryCode: { $ifNull: ["$countryCode", "TR"] },
          scholarshipType: {
            $ifNull: ["$scholarshipType", { $cond: ["$hasMeritScholarship", "partially_funded", "none"] }],
          },
          aliases: { $ifNull: ["$aliases", []] },
          featuredOnHome: { $ifNull: ["$featuredOnHome", false] },
          homeOrder: { $ifNull: ["$homeOrder", 0] },
        },
      },
    ],
  );
  console.log(`Backfilled ${result.modifiedCount} universities`);
  process.exit(0);
}

backfill().catch((error) => {
  console.error(error);
  process.exit(1);
});
