import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { subDays } from "date-fns";

// Set SEED_ORG_ID to a Better Auth organization ID before running
// Create an org via the UI at /org-select first, then use its ID
const ORG_ID = process.env.SEED_ORG_ID as string;
if (!ORG_ID) {
  throw new Error("SEED_ORG_ID is not set. Create an organization at /org-select and copy its ID.");
}

const jobListings = [
  {
    title: "Senior Frontend Developer",
    description:
      "We are looking for a Senior Frontend Developer to lead our web application team. You will be responsible for building and maintaining high-quality user interfaces using React and TypeScript. The ideal candidate has 5+ years of experience and a strong understanding of modern frontend architecture. You will work closely with our design team to implement pixel-perfect UIs and collaborate with backend engineers to integrate APIs.",
    wage: 150000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "CA",
    city: "San Francisco",
    locationRequirement: "hybrid" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: true,
    postedAt: subDays(new Date(), 1),
  },
  {
    title: "Backend Engineer - Node.js",
    description:
      "Join our backend team to build scalable APIs and microservices using Node.js and TypeScript. You will design and implement RESTful and GraphQL APIs, optimize database queries, and ensure system reliability. Experience with PostgreSQL, Redis, and cloud services (AWS/GCP) is preferred. We value clean code, thorough testing, and documentation.",
    wage: 135000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "NY",
    city: "New York",
    locationRequirement: "in-office" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: true,
    postedAt: subDays(new Date(), 2),
  },
  {
    title: "Full Stack Developer",
    description:
      "We need a versatile Full Stack Developer to work on our core product. You will work across the entire stack — from designing database schemas and building APIs to creating responsive frontend interfaces. This role is perfect for someone who enjoys variety and can take ownership of features end-to-end. Tech stack includes React, Node.js, PostgreSQL, and Docker.",
    wage: 120000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "TX",
    city: "Austin",
    locationRequirement: "in-office" as const,
    experienceLevel: "mid-level" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 3),
  },
  {
    title: "DevOps Engineer",
    description:
      "We are seeking a DevOps Engineer to help us build and maintain our cloud infrastructure. You will manage CI/CD pipelines, container orchestration with Kubernetes, monitoring and alerting systems, and infrastructure as code using Terraform. Experience with AWS, Docker, and Linux administration is required. You will work with development teams to ensure smooth deployments and system reliability.",
    wage: 140000,
    wageInterval: "yearly" as const,
    stateAbbreviation: null,
    city: null,
    locationRequirement: "remote" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 4),
  },
  {
    title: "Junior React Developer",
    description:
      "Great opportunity for a junior developer to join a growing team. You will work on building user interfaces using React and TypeScript under the guidance of senior developers. You will participate in code reviews, learn best practices, and contribute to real features from day one. Basic knowledge of React, HTML, CSS, and JavaScript is required.",
    wage: 70000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "WA",
    city: "Seattle",
    locationRequirement: "in-office" as const,
    experienceLevel: "junior" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 5),
  },
  {
    title: "Data Scientist",
    description:
      "Join our data team to build machine learning models and analytics pipelines. You will work on recommendation systems, user behavior analysis, and A/B testing. Proficiency in Python, SQL, and ML frameworks (TensorFlow, PyTorch) is required. Experience with big data tools (Spark, Airflow) is a plus. You will collaborate with product managers to identify opportunities for data-driven improvements.",
    wage: 155000,
    wageInterval: "yearly" as const,
    stateAbbreviation: null,
    city: null,
    locationRequirement: "remote" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: true,
    postedAt: subDays(new Date(), 6),
  },
  {
    title: "Product Designer",
    description:
      "We are looking for a talented Product Designer to create beautiful and intuitive user experiences. You will work closely with product managers and engineers throughout the design process — from user research and wireframing to high-fidelity prototypes and design systems. Proficiency in Figma and a strong portfolio demonstrating UX/UI design skills is required.",
    wage: 110000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "CA",
    city: "Los Angeles",
    locationRequirement: "hybrid" as const,
    experienceLevel: "mid-level" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 7),
  },
  {
    title: "Mobile Developer - React Native",
    description:
      "We need a React Native developer to build and maintain our mobile applications. You will develop cross-platform mobile apps for iOS and Android, implement new features, and improve app performance. Experience with React Native, TypeScript, and mobile app deployment is required. Knowledge of native modules and Expo is a plus.",
    wage: 125000,
    wageInterval: "yearly" as const,
    stateAbbreviation: null,
    city: null,
    locationRequirement: "remote" as const,
    experienceLevel: "mid-level" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 8),
  },
  {
    title: "QA Engineer",
    description:
      "Join our quality assurance team to ensure our products meet the highest standards. You will write and maintain automated tests, perform manual testing, and work with developers to reproduce and resolve bugs. Experience with testing frameworks (Cypress, Playwright, Jest), CI/CD pipelines, and test planning is required. Strong attention to detail is a must.",
    wage: 95000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "IL",
    city: "Chicago",
    locationRequirement: "in-office" as const,
    experienceLevel: "mid-level" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 9),
  },
  {
    title: "Python Backend Developer",
    description:
      "We are hiring a Python Backend Developer to build and maintain our server-side applications. You will develop RESTful APIs, work with databases, and integrate third-party services. Proficiency in Python, SQLAlchemy, FastAPI or Django, and PostgreSQL is required. Experience with message queues (RabbitMQ, Celery) is a plus.",
    wage: 115000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "CO",
    city: "Denver",
    locationRequirement: "hybrid" as const,
    experienceLevel: "mid-level" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 10),
  },
  {
    title: "Intern - Software Engineering",
    description:
      "Summer internship opportunity for current students or recent graduates in Computer Science or related fields. You will work on real projects, attend team meetings, and receive mentorship from senior engineers. Basic programming knowledge in any language is required. This is a paid internship with potential for full-time conversion.",
    wage: 30,
    wageInterval: "hourly" as const,
    stateAbbreviation: "CA",
    city: "San Jose",
    locationRequirement: "in-office" as const,
    experienceLevel: "junior" as const,
    type: "internship" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 11),
  },
  {
    title: "Technical Writer",
    description:
      "We are looking for a Technical Writer to create clear and comprehensive documentation for our products. You will write API documentation, user guides, tutorials, and release notes. Experience with documentation tools (Markdown, GitBook, ReadTheDocs) and the ability to understand complex technical concepts is required. Strong English writing skills are essential.",
    wage: 60000,
    wageInterval: "yearly" as const,
    stateAbbreviation: null,
    city: null,
    locationRequirement: "remote" as const,
    experienceLevel: "junior" as const,
    type: "part-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 12),
  },
  {
    title: "Security Engineer",
    description:
      "We need a Security Engineer to protect our systems and data. You will conduct security assessments, implement security controls, respond to incidents, and educate the team on security best practices. Experience with cloud security, penetration testing, and security frameworks (OWASP, NIST) is required. Certifications like CISSP or OSCP are a plus.",
    wage: 145000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "VA",
    city: "Arlington",
    locationRequirement: "hybrid" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: true,
    postedAt: subDays(new Date(), 13),
  },
  {
    title: "Site Reliability Engineer",
    description:
      "Join our SRE team to ensure the reliability, scalability, and performance of our distributed systems. You will design and implement monitoring solutions, automate operations, conduct incident post-mortems, and work on capacity planning. Experience with Kubernetes, Terraform, observability tools (Datadog, Grafana), and incident management is required.",
    wage: 150000,
    wageInterval: "yearly" as const,
    stateAbbreviation: null,
    city: null,
    locationRequirement: "remote" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: false,
    postedAt: subDays(new Date(), 14),
  },
  {
    title: "Engineering Manager",
    description:
      "We are seeking an experienced Engineering Manager to lead a team of 6-8 engineers. You will be responsible for team growth, project planning, technical direction, and fostering a healthy engineering culture. You should have strong technical background (preferably full-stack), experience managing engineers, and excellent communication skills. You will still be expected to contribute technically.",
    wage: 175000,
    wageInterval: "yearly" as const,
    stateAbbreviation: "CA",
    city: "San Francisco",
    locationRequirement: "in-office" as const,
    experienceLevel: "senior" as const,
    type: "full-time" as const,
    isFeatured: true,
    postedAt: subDays(new Date(), 0),
  },
] as const;

async function seed() {
  console.log(`Seeding ${jobListings.length} job listings...`);

  for (const listing of jobListings) {
    const result = await db
      .insert(JobListingTable)
      .values({
        ...listing,
        organizationId: ORG_ID,
        status: "published",
      })
      .returning({ id: JobListingTable.id, title: JobListingTable.title });

    console.log(`  ✓ ${result[0].title}`);
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
