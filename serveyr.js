import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Allow only your frontend origin
app.use(
  cors({
    origin: "https://calm-blini-19cff1.netlify.app",
  })
);

const SMARTPAY_API_KEY = process.env.SMARTPAY_API_KEY;
const SMARTPAY_BASE_URL = "https://api.smartpay.co.ke/v1";

// 📝 Helper logger
function logRequest(endpoint, payload) {
  console.log(`\n📨 [REQUEST → ${endpoint}]`);
  console.log(JSON.stringify(payload, null, 2));
}

function logResponse(endpoint, status, data) {
  console.log(`\n✅ [RESPONSE ← ${endpoint}] Status: ${status}`);
  console.log(JSON.stringify(data, null, 2));
}

// 🔹 Route: Initiate STK Push
app.post("/stkpush", async (req, res) => {
  try {
    logRequest("STK Push", req.body);

    const { phone, amount, account_reference, description } = req.body;

    const response = await fetch(`${SMARTPAY_BASE_URL}/initiatestk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: SMARTPAY_API_KEY,
      },
      body: JSON.stringify({
        phone,
        amount,
        account_reference,
        description,
      }),
    });

    const data = await response.json();
    logResponse("STK Push", response.status, data);
    res.status(response.status).json(data);
  } catch (error) {
    console.error("❌ [STK Push ERROR]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Route: Check Balance
app.post("/balance", async (req, res) => {
  try {
    logRequest("Balance", req.body);

    const { phone } = req.body;

    const response = await fetch(`${SMARTPAY_BASE_URL}/initiatebalance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMARTPAY_API_KEY}`,
      },
      body: JSON.stringify({
        phone,
        account_reference: "BALANCE",
      }),
    });

    const data = await response.json();
    logResponse("Balance", response.status, data);
    res.status(response.status).json(data);
  } catch (error) {
    console.error("❌ [Balance ERROR]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Route: Check Transaction Status
app.post("/transactionstatus", async (req, res) => {
  try {
    logRequest("Transaction Status", req.body);

    const { CheckoutRequestID } = req.body;

    const response = await fetch(`${SMARTPAY_BASE_URL}/transactionstatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMARTPAY_API_KEY}`,
      },
      body: JSON.stringify({ CheckoutRequestID }),
    });

    const data = await response.json();
    logResponse("Transaction Status", response.status, data);
    res.status(response.status).json(data);
  } catch (error) {
    console.error("❌ [Transaction Status ERROR]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Webhook Callback (SmartPay will POST here)
app.post("/webhook", async (req, res) => {
  console.log("\n🌐 [WEBHOOK CALLBACK RECEIVED]");
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: "Webhook received" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SmartPay Server running on port ${PORT}`);
});