/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   MomentO — Local MongoDB → Atlas Migration Script       ║
 * ║   Run: node migrate_to_atlas.js                          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

const { MongoClient } = require("mongodb");

const LOCAL_URI  = "mongodb://127.0.0.1:27017/momento";
const ATLAS_URI  = "mongodb+srv://padmasrinamala3_db_user:padhu2004@cluster0.beq18z3.mongodb.net/momento?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME    = "momento";
const COLLECTIONS = ["users", "events", "bookings", "reviews"];

async function migrate() {
  let localClient, atlasClient;

  try {
    console.log("\n🔌 Connecting to Local MongoDB...");
    localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    console.log("   ✅ Local connection established.");

    console.log("\n🌐 Connecting to MongoDB Atlas...");
    atlasClient = new MongoClient(ATLAS_URI);
    await atlasClient.connect();
    console.log("   ✅ Atlas connection established.");

    const localDb = localClient.db(DB_NAME);
    const atlasDb = atlasClient.db(DB_NAME);

    let totalMigrated = 0;

    for (const collectionName of COLLECTIONS) {
      console.log(`\n📦 Migrating collection: [${collectionName}]`);

      const localCollection = localDb.collection(collectionName);
      const atlasCollection = atlasDb.collection(collectionName);

      const docs = await localCollection.find({}).toArray();
      const localCount = docs.length;

      if (localCount === 0) {
        console.log(`   ℹ️  No documents found in local [${collectionName}]. Skipping.`);
        continue;
      }

      console.log(`   📄 Found ${localCount} documents in local DB.`);

      let inserted = 0;
      let skipped  = 0;

      for (const doc of docs) {
        try {
          // Try inserting; skip if _id already exists on Atlas (avoids duplicates)
          await atlasCollection.insertOne(doc);
          inserted++;
        } catch (err) {
          if (err.code === 11000) {
            // Duplicate key — document already exists on Atlas
            skipped++;
          } else {
            throw err;
          }
        }
      }

      const atlasCount = await atlasCollection.countDocuments();
      console.log(`   ✅ Inserted: ${inserted} | Skipped (already exist): ${skipped} | Atlas total: ${atlasCount}`);
      totalMigrated += inserted;
    }

    console.log(`\n🎉 Migration complete! Total new documents migrated: ${totalMigrated}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
  }
}

migrate();
