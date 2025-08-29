import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import chalk from "chalk";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// ✅ Allow only your frontend
app.use(
  cors({
    origin: "https://demostkpush.netlify.app",
  })
);

// Health check
app.get("/", (req, res) => {
  console.log(chalk.blue("[SERVER] GET / - Health check"));
  res.json({ status: "✅ Server running fine" });
});

// STK Push endpoint
app.post("/stkpush", async (req, res) => {
  console.log(chalk.yellow("[REQUEST] /stkpush"), req.body);

  try {
    const response = await fetch(
      `${process.env.SMARTPAY_BASE_URL}/mobile-money/stk-push`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SMARTPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    console.log(chalk.green("[SUCCESS] STK Push response:"), data);

    res.json(data);
  } catch (error) {
    console.error(chalk.red("[ERROR] STK Push failed:"), error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Webhook (SmartPay callback)
app.post("/webhook", (req, res) => {
  console.log(chalk.cyan("[WEBHOOK] Received:"), req.body);
  res.sendStatus(200); // Always ACK
});

// Start server
app.listen(PORT, () => {
  console.log(chalk.greenBright(`🚀 Server running on port ${PORT}`));
});
