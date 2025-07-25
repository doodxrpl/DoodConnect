import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const XUMM_API_KEY = "368f9a7b-9750-4750-8017-e8cbadff4f68";
const XRPL_NODE = "https://s1.ripple.com:51234";

app.use(cors());
app.use(bodyParser.json());

app.post("/api/create-payload", async (req, res) => {
  try {
    const payload = { txjson: { TransactionType: "SignIn" } };
    const response = await fetch("https://xumm.app/api/v1/platform/payload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": XUMM_API_KEY
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Payload creation error:", err);
    res.status(500).json({ error: "Failed to create payload" });
  }
});

app.get("/api/check-payload/:uuid", async (req, res) => {
  const { uuid } = req.params;
  try {
    const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
      headers: { "X-API-Key": XUMM_API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Payload check error:", err);
    res.status(500).json({ error: "Failed to check payload" });
  }
});

app.get("/api/wallet/:address", async (req, res) => {
  const wallet = req.params.address;
  try {
    const accountInfoRes = await fetch(XRPL_NODE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_info",
        params: [{ account: wallet, ledger_index: "validated" }]
      })
    });
    const accountInfo = await accountInfoRes.json();
    const xrpBalance = parseFloat(accountInfo.result.account_data.Balance) / 1000000;

    const trustlinesRes = await fetch(XRPL_NODE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_lines",
        params: [{ account: wallet }]
      })
    });
    const trustlines = await trustlinesRes.json();

    res.json({
      wallet,
      xrpBalance,
      trustlines: trustlines.result.lines
    });
  } catch (err) {
    console.error("Wallet fetch error:", err);
    res.status(500).json({ error: "Failed to fetch wallet data" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
