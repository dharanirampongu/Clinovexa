// One-time migration: normalize stored mobile numbers and enforce uniqueness.
// - Normalizes every User.phone via the shared normalizePhone() helper so
//   equivalent formats collapse to one canonical value.
// - Empty values are left as '' (excluded from the unique index).
// - If two users normalize to the same number, the earliest-created keeps it;
//   later duplicates are cleared to '' and reported (no data deleted).
// - Rebuilds the unique sparse+partial index on User.phone.
//
// Usage: `cd backend && node migrate-phone-unique.js`
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { normalizePhone } = require('./src/utils/phone');

const run = async () => {
  await connectDB();
  const User = require('./src/models/User');

  const users = await User.find({}).sort({ createdAt: 1 });
  const seen = new Map();
  let normalized = 0;
  let cleared = 0;

  for (const user of users) {
    const canonical = normalizePhone(user.phone);
    if (!canonical) {
      if (user.phone !== '' && user.phone !== undefined) {
        user.phone = '';
        await user.save({ validateBeforeSave: false });
      }
      continue;
    }
    if (user.phone !== canonical) {
      normalized += 1;
    }
    if (seen.has(canonical)) {
      logger.warn(
        `Duplicate mobile ${canonical}: clearing for user ${user.email} (kept for ${seen.get(canonical)})`
      );
      user.phone = '';
      await user.save({ validateBeforeSave: false });
      cleared += 1;
    } else {
      seen.set(canonical, user.email);
      if (user.phone !== canonical) {
        user.phone = canonical;
        await user.save({ validateBeforeSave: false });
      }
    }
  }

  // Ensure indexes (creates the unique phone index if missing)
  await User.syncIndexes();

  logger.info(`Phone migration complete: ${normalized} normalized, ${cleared} duplicates cleared.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Phone migration failed: ${err.message}`);
  process.exit(1);
});
