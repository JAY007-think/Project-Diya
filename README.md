# 🔧 DIYA — Intelligent AI-Powered DIY Assistant

[![Watch the Demo](https://img.youtube.com/vi/lHhN5YxvpjY/0.jpg)](https://www.youtube.com/watch?v=lHhN5YxvpjY)

> 🎥 Click the image above to watch the demo
> 🏆 Amazon Nova Hackathon Project

---

## 🚀 Overview

**DIYA** is an AI-powered DIY repair assistant that helps users fix devices using **image/video understanding + real-time guidance**.

Built using **Amazon Nova (Bedrock)**, DIYA can:

* 📷 Analyze device images
* 🛠 Diagnose issues
* 📋 Generate step-by-step repair instructions
* ⚠ Provide real-time safety alerts
* 💬 Answer follow-up questions interactively

---

## ⚡ Quick Start

### 1️⃣ Add AWS Credentials

Create a `.env` file in the root directory:

```env
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
AWS_REGION=us-east-1
```

> ✅ Ensure:
>
> * Amazon Bedrock is enabled
> * Access to **Nova Pro** and **Nova Lite** is granted
> * Region is set to `us-east-1`

---

### 2️⃣ Run the App

```bash
npm install
npm run dev
```

🌐 Open: **http://localhost:3000**

---

## 🏗️ Project Structure

```
diya/
├── backend/
│   └── server.js              # Express + WebSocket + Nova API
├── src/
│   ├── pages/
│   │   ├── Landing.jsx        # Landing page
│   │   └── RepairSession.jsx  # Main repair interface
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── VideoPane.jsx      # Image upload + vision analysis
│   │   ├── StepsPanel.jsx     # Repair steps UI
│   │   ├── ChatPanel.jsx      # Streaming AI chat
│   │   └── AlertBanner.jsx    # Safety alerts
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env
```

---

## 🤖 AI Capabilities

| Feature                           | Model        | Endpoint                 |
| --------------------------------- | ------------ | ------------------------ |
| 🔍 Device analysis & repair steps | nova-pro-v1  | `POST /api/analyze`      |
| 💬 Streaming AI chat              | nova-lite-v1 | `POST /api/chat/stream`  |
| ⚠ Safety detection                | nova-lite-v1 | `POST /api/safety-check` |
| 🎥 Real-time frame analysis       | nova-lite-v1 | WebSocket `/ws`          |

---

## 🛠️ How It Works

1. Open **http://localhost:3000**
2. Click **"Start Repair Session"**
3. Upload an image of your device
4. (Optional) Describe the issue
5. Click **"Analyze Device"**
6. Get:

   * Device identification
   * Issue diagnosis
   * Step-by-step repair guide
7. Follow steps, ask questions, and proceed interactively

---

## 🛡️ Safety First

DIYA continuously checks for:

* ⚡ Electrical hazards
* 🔥 Overheating risks
* ⚠ Unsafe repair steps

…and alerts users in real time.

---

## ☁️ AWS Setup Guide

1. Create an AWS account
2. Enable **Amazon Bedrock**
3. Request access to:

   * Nova Pro
   * Nova Lite
4. Create IAM user with:

   ```
   AmazonBedrockFullAccess
   ```
5. Generate access keys → paste in `.env`

---

## 💡 Key Highlights

* ⚡ Real-time AI guidance
* 🧠 Multimodal understanding (image + text)
* 🔄 Interactive repair workflow
* 🛡 Built-in safety intelligence
* 🌐 Full-stack (React + Node + WebSockets)

---

## 📌 Future Improvements

* 📱 Mobile app support
* 🧰 Tool detection & suggestions
* 🎯 AR-based repair guidance
* 🌍 Multi-language support

---

## 👨‍💻 Author

**Jay Soni**

---

## ⭐ Show Your Support

If you like this project, consider giving it a ⭐ on GitHub!
