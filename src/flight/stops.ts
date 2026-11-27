import { github, projects, type Project } from "../projects";

export const resume = "/Rohith-Kumar-Dhamagatla.pdf";
export const mail = "mailto:rajuchaswik@gmail.com";
export const linkedin = "https://www.linkedin.com/in/rohith-kumar-dhamagatla/";
export const paper = "https://doi.org/10.1109/ICSADL67539.2026.11452024";
export const contribution =
  "https://github.com/Shyam-Sundar-Raju/Plant_disease_detection/pull/16";
export type Stop = {
  id: string;
  group: string;
  title: string;
  body: string;
  project?: Project;
  links?: [string, string][];
};
export const stops: Stop[] = [
  {
    id: "departure",
    group: "Departure",
    title: "Rohith Kumar Dhamagatla",
    body: "AI/ML and full-stack engineer from Anantapur, India.",
  },
  {
    id: "trickee",
    group: "Internships",
    title: "Trickee Technologies",
    body: "I built FastAPI endpoints for an electric fleet. GPS readings became PostgreSQL trip records that supported route planning and energy estimates.",
  },
  {
    id: "ekam",
    group: "Internships",
    title: "EKAM",
    body: "For TravelSeasons, I connected booking screens to transaction workflows across React, Express and MongoDB.",
  },
  {
    id: "ryl",
    group: "Internships",
    title: "RYL NeuroAcademy",
    body: "At Saathi AI, I connected document processing, embeddings and semantic search so a conversational model could retrieve relevant context before answering.",
  },
  ...projects.map((project) => ({
    id: project.id,
    group: "Projects",
    title: project.name,
    body: project.intro,
    project,
  })),
  {
    id: "architecture",
    group: "Architecture",
    title: "Inside the systems",
    body: "Follow a request from its first input to its final result. Play the handoffs, pause at a decision, and inspect the code behind each step.",
  },
  {
    id: "research",
    group: "Research",
    title: "Looking inside the model",
    body: "I used GoogLeNet to classify lung nodules on LUNA16 and Grad-CAM to see which regions influenced a prediction. The study reports 96% test accuracy.",
    links: [["Read the paper", paper]],
  },
  {
    id: "education",
    group: "Education",
    title: "Two paths into computing",
    body: "I study Computer Science at Amrita Vishwa Vidyapeetham and Data Science and Applications at IIT Madras.",
    links: [["Résumé", resume]],
  },
  {
    id: "contact",
    group: "Arrival",
    title: "Get in touch",
    body: "Thanks for flying with me. I’d love to hear what you’re building.",
    links: [
      ["Email Rohith", mail],
      ["GitHub", github],
      ["LinkedIn", linkedin],
    ],
  },
];
