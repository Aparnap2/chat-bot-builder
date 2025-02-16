
# 🤖 ChatBuilder - AI Chatbot SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Remix Version](https://img.shields.io/badge/Remix-2.0.0-%23005C9E)](https://remix.run/)
[![Prisma Version](https://img.shields.io/badge/Prisma-5.10.2-%232D3748)](https://www.prisma.io/)

A modern no-code platform for building, customizing, and deploying AI-powered chatbots with enterprise-grade features. Built with ❤️ using Remix, Prisma, and Google Gemini.

![ChatCraft Demo](https://via.placeholder.com/800x400.png?text=ChatCraft+Demo+Preview)
![Screenshot_2025-02-13_10_49_35](https://github.com/user-attachments/assets/97172dbe-9ed8-44fa-b455-f78fc6c532e1)


## 🚀 Features

- **Visual Chatbot Builder** with drag-and-drop interface
- **Multi-channel Deployment** (Web, Slack, Discord, API)
- **Real-time Chat Preview** with brand customization
- **Document Processing** (PDF/TXT) for AI context
- **Prompt Engineering Studio** with version control
- **Analytics Dashboard** with conversation insights
- **Enterprise-grade Security** with rate limiting & RBAC
- **API-first Architecture** with WebSocket support

## ⚙️ Tech Stack

**Frontend**  
▸ Remix ▸ React ▸ TypeScript ▸ Tailwind CSS ▸ shadcn/ui  

**Backend**  
▸ Node.js ▸ Prisma ▸ Redis ▸ Google Gemini ▸ PostgreSQL  

**Services**  
▸ Kinde Auth ▸ Upstash Rate Limiting ▸ Docker ▸ Vercel  

## 🛠️ Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/chatcraft.git
cd chatcraft
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env` from `.env.example`):
```ini
# Required
DATABASE_URL="postgresql://..."
KINDE_CLIENT_ID="your_kinde_client_id"
KINDE_CLIENT_SECRET="your_kinde_secret"
GEMINI_API_KEY="your_google_api_key"
REDIS_URL="your_redis_url"

# Optional
STRIPE_API_KEY="your_stripe_key"
```

4. Database setup:
```bash
npx prisma migrate dev
```

5. Start development server:
```bash
npm run dev
```

## 🎨 Configuration

### Environment Variables
| Variable              | Required | Description                     |
|-----------------------|----------|---------------------------------|
| `DATABASE_URL`        | Yes      | PostgreSQL connection string   |
| `KINDE_CLIENT_ID`     | Yes      | Kinde authentication ID        |
| `GEMINI_API_KEY`      | Yes      | Google Gemini API key          |
| `REDIS_URL`           | Yes      | Redis connection URL           |
| `STRIPE_API_KEY`      | No       | Stripe payments integration    |

### First-Time Setup
1. Create Kinde application at [Kinde](https://kinde.com)
2. Enable Google authentication in Kinde dashboard
3. Get Google Gemini API key from [AI Studio](https://aistudio.google.com)

## 📚 API Documentation

### Key Endpoints

**Create Chatbot**
```bash
curl -X POST /api/chatbots \
  -H "Authorization: Bearer {API_KEY}" \
  -d '{"name": "Support Bot", "flow": [...]}'
```

**Send Message**
```bash
curl -X POST /api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Help reset password", "session_id": "..."}'
```

**Get Analytics**
```bash
curl -X GET /api/analytics/conversations \
  -H "Authorization: Bearer {API_KEY}"
```

[View Full API Documentation](docs/api-reference.md)

## 🌐 Deployment

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chatcraft)

### Docker
```bash
docker build -t chatcraft .
docker run -p 3000:3000 --env-file .env chatcraft
```

### Manual Deployment
1. Build production bundle:
```bash
npm run build
```

2. Start server:
```bash
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Coding Standards**
- TypeScript strict mode enabled
- ESLint/Prettier configuration
- 80%+ test coverage required
- Conventional commits

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- Remix Framework Team
- Prisma ORM Maintainers
- Kinde Authentication Service
- Google Gemini AI Team
