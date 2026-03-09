# 🔧 DIYA — Intelligent AI-Powered DIY Assistant

> Amazon Nova Hackathon Project

DIYA uses Amazon Nova's multimodal power to guide users through device repairs via video/image analysis, ensuring safety with real-time alerts and interactive step-by-step instructions.

---

## ⚡ Quick Start (2 Commands)

### Step 1 — Add your AWS credentials

Open `.env` file and fill in your AWS keys:

```
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
AWS_REGION=us-east-1
```

> Make sure Amazon Bedrock is enabled in your AWS account and Nova Pro model is accessible in us-east-1.

### Step 2 — Run it!

```bash
npm install
npm run dev
```

That's it! Open: **http://localhost:3000**

---

## 🏗 Project Structure

```
diya/
├── backend/
│   └── server.js          # Express + WebSocket + Amazon Nova API
├── src/
│   ├── pages/
│   │   ├── Landing.jsx    # Landing page
│   │   └── RepairSession.jsx  # Main repair interface
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── VideoPane.jsx  # Image upload + Nova Vision
│   │   ├── StepsPanel.jsx # Step-by-step repair guide
│   │   ├── ChatPanel.jsx  # Streaming chat with Nova
│   │   └── AlertBanner.jsx # Safety alerts
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env                   # ← Add your AWS keys here
```

---

## 🤖 AI Features

| Feature | Model | Endpoint |
|---|---|---|
| Device analysis + repair steps | nova-pro-v1 | `POST /api/analyze` |
| Streaming chat | nova-lite-v1 | `POST /api/chat/stream` |
| Quick safety check | nova-lite-v1 | `POST /api/safety-check` |
| Real-time frame analysis | nova-lite-v1 | WebSocket `/ws` |

---

## 🛡 How to Use

1. Go to **http://localhost:3000**
2. Click **"Start Repair Session"**
3. Upload a photo of your broken device
4. Optionally describe the issue
5. Click **"Analyze Device"**
6. DIYA will identify the device, diagnose the issue, and provide step-by-step repair instructions
7. Follow steps, ask questions in the chat, and mark each step done as you go

---

## AWS Setup

1. Create an AWS account if you don't have one
2. Enable **Amazon Bedrock** in `us-east-1`
3. Request access to **Amazon Nova Pro** and **Nova Lite** models
4. Create an IAM user with `AmazonBedrockFullAccess` policy
5. Generate access keys and paste in `.env`
