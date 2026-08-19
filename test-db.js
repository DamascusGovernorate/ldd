require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Check that .env exists in this folder and has that key.");
  process.exit(1);
}

console.log("Attempting connection with URI (password hidden):");
console.log(process.env.MONGODB_URI.replace(/:[^:@]+@/, ":****@"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });