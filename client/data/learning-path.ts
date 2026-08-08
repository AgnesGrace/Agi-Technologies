import {
  BrainCircuit,
  Monitor,
  Server,
  Layers3,
  Cloud,
  Workflow,
} from "lucide-react"

export const learningPaths = [
  {
    title: "AI Engineering",
    description:
      "Build AI applications with LLMs, RAG, AI Agents, MCP, and modern AI tooling.",
    icon: BrainCircuit,
    courses: 12,
    projects: 18,
    duration: "6 Months",
    link: "/paths/ai-engineering",
  },
  {
    title: "Frontend Engineering",
    description:
      "Master React, Next.js, TypeScript, Tailwind CSS, and modern frontend architecture.",
    icon: Monitor,
    courses: 14,
    projects: 20,
    duration: "5 Months",
    link: "/paths/frontend",
  },
  {
    title: "Backend Engineering",
    description:
      "Design scalable APIs using Node.js, Express, PostgreSQL, Prisma, and Docker.",
    icon: Server,
    courses: 13,
    projects: 16,
    duration: "5 Months",
    link: "/paths/backend",
  },
  {
    title: "Full Stack Engineering",
    description:
      "Become a complete software engineer by mastering frontend, backend, databases, and deployment.",
    icon: Layers3,
    courses: 24,
    projects: 30,
    duration: "8 Months",
    link: "/paths/fullstack",
  },
  {
    title: "Cloud Engineering",
    description:
      "Deploy, scale, and manage cloud infrastructure with AWS, Docker, Kubernetes, and Terraform.",
    icon: Cloud,
    courses: 10,
    projects: 14,
    duration: "4 Months",
    link: "/paths/cloud",
  },
  {
    title: "DevOps Engineering",
    description:
      "Automate software delivery using CI/CD, Docker, Kubernetes, GitHub Actions, and monitoring tools.",
    icon: Workflow,
    courses: 11,
    projects: 15,
    duration: "4 Months",
    link: "/paths/devops",
  },
]
