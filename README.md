# AGI Technologies - Learning Management System

A comprehensive learning management platform designed to empower individuals to learn and build successful careers in technology.

## Overview

AGI Technologies is an innovative LMS (Learning Management System) that connects learners with quality tech education and career opportunities. Our platform enables students to acquire in-demand skills, track progress, and launch their careers in the tech industry.

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **API**: RESTful

### Frontend

- **Framework**: Next.js
- **State Management**: Redux

## Features

- **Course Management**: Browse, enroll, and complete tech courses
- **Progress Tracking**: Monitor learning progress with detailed analytics
- **Career Pathways**: Structured learning paths leading to tech careers
- **User Dashboard**: Personalized learning dashboard with recommendations
- **Interactive Content**: Engaging course materials and assignments
- **Certification**: Earn certificates upon course completion
- **Global State Management**: Seamless user experience with Redux state management

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- npm or yarn

### Installation

#### Backend Setup

```bash
cd backend
npm install
# Configure your .env file with Neon PostgreSQL connection
npx prisma migrate dev
npm start
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**

```
DATABASE_URL=your_neon_postgresql_url
NODE_ENV=development
PORT=8000
```

**Frontend (.env.local)**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Project Structure

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/Feature`)
3. Commit your changes (`git commit -m 'Add Feature'`)
4. Push to the branch (`git push origin feature/Feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@agitechnologies.com or open an issue in the repository.

---

**Happy Learning! 🚀**
