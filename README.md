# E-commerce Platform

Production-ready, scalable e-commerce platform with Web App, Mobile App, and Backend API.

## 🏗 Architecture

```
com/
├── backend/          # NestJS API (Node.js)
├── web/             # Next.js (Customer + Admin)
├── mobile/          # React Native (Expo)
├── docker/          # Docker configs
├── docs/            # Documentation
└── .github/         # CI/CD
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15
- Redis 7
- Docker (optional)

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database, Redis, and API keys
```

### 2. Database & Redis (Docker)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```
API: http://localhost:3001/api/v1  
Swagger: http://localhost:3001/api/docs

### 4. Web App
```bash
cd web
npm install
npm run dev
```
Web: http://localhost:3000

### 5. Mobile App
```bash
cd mobile
npm install
npx expo start
```

## 📋 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| User | user@ecommerce.com | User@123 |

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, Prisma, PostgreSQL, Redis |
| Web | Next.js 14, Tailwind, Redux Toolkit |
| Mobile | React Native, Expo |
| Auth | JWT + Refresh Tokens, Google OAuth |
| Payments | Stripe, Razorpay |
| Storage | AWS S3 |

## 📚 API Documentation

- Swagger UI: `http://localhost:3001/api/docs`
- Postman: See `docs/postman-collection.json`

## 📁 Key Features

- **User**: Register, Login, Profile, Cart, Wishlist, Orders, Reviews
- **Products**: Categories, Search, Variants, Inventory
- **Payments**: Stripe, Razorpay, Webhooks
- **Admin**: Dashboard, Orders, Users, Coupons, CMS
- **AI**: Recommendations, Frequently Bought Together

## 🛡 Security

- JWT with refresh token rotation
- Rate limiting (Helmet)
- Input validation (class-validator, Zod)
- Password hashing (bcrypt)
- RBAC (User, Admin, SuperAdmin)

## 📦 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for AWS, Docker, and Nginx setup.

## 📄 License

MIT
