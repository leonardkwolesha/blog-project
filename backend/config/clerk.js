// backend/config/clerk.js
import Clerk from "@clerk/clerk-sdk-node"; // ✅ default import

// Initialize Clerk with your secret key
const clerk = new Clerk({
  apiKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

export default clerk; // ✅ export default
