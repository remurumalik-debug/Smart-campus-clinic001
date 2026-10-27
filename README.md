# Smart Campus Clinic

Smart Campus Clinic is a web application for university health services. It supports student appointment booking, clinic staff workflows, administration, notifications, and an AI-assisted clinic chatbot.

## Intended use

This project is intended for university and educational use. It does not include a license file.

## Requirements

- Node.js 20 or later
- npm
- MongoDB (local or MongoDB Atlas)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root and configure the services you use:

   ```dotenv
   MONGODB_URI=
   MONGODB_SRV_URI=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   OPENROUTER_API_KEY=
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=
   ```

   Set at least one MongoDB connection URI and a strong `NEXTAUTH_SECRET`. The chatbot and email features need their respective API key or SMTP settings. See [MongoDB Atlas setup](./MONGODB_ATLAS_SETUP.md) for database configuration. Never commit `.env.local` or real credentials.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Available commands

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve a production build
- `npm run lint` — run ESLint

## Deployment

Configure the required environment variables with your hosting provider and deploy the application as a Next.js project. Restrict database network access and use dedicated production credentials.
