require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sendEmail = require("../utils/sendEmail");

const run = async () => {
  console.log("Sending test email...");
  console.log(`  Host : ${process.env.EMAIL_HOST}`);
  console.log(`  User : ${process.env.EMAIL_USER}`);
  console.log(`  From : ${process.env.EMAIL_FROM}`);

  await sendEmail({
    to: process.env.EMAIL_USER, // sends to yourself
    subject: "LMS Email Test",
    html: "<h2>It works!</h2><p>Your Nodemailer + Gmail setup is working correctly.</p>",
    text: "It works! Your Nodemailer + Gmail setup is working correctly.",
  });

  console.log("✅ Email sent successfully. Check your inbox.");
};

run().catch((err) => {
  console.error("❌ Failed to send email:");
  console.error(err.message);
  process.exit(1);
});
