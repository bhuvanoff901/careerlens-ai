export type CareerRole = {
  title: string;
  description: string;
  skills: string[];
  projects: string[];
  resource: { name: string; url: string };
};

export const careerCatalog: CareerRole[] = [
  {
    title: "Frontend developer",
    description: "Build accessible, responsive interfaces for web applications.",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "accessibility"],
    projects: ["Create a keyboard-accessible task planner.", "Build a responsive data dashboard."],
    resource: { name: "MDN Learn Web Development", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development" },
  },
  {
    title: "Backend developer",
    description: "Design APIs, data models, and reliable application services.",
    skills: ["Python", "Java", "SQL", "REST", "testing", "security"],
    projects: ["Build a documented REST API.", "Add authentication and tests to a small service."],
    resource: { name: "FastAPI documentation", url: "https://fastapi.tiangolo.com/tutorial/" },
  },
  {
    title: "Data analyst",
    description: "Turn well-sourced data into clear, useful analysis.",
    skills: ["SQL", "Python", "statistics", "visualization", "communication"],
    projects: ["Analyze an open public dataset and document limitations.", "Create a reproducible data notebook."],
    resource: { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
  },
  {
    title: "Product designer",
    description: "Research user needs and shape useful, inclusive product experiences.",
    skills: ["research", "prototyping", "accessibility", "visual design", "communication"],
    projects: ["Audit an interface for keyboard access.", "Prototype and test a small workflow."],
    resource: { name: "Figma Learn", url: "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design" },
  },
  {
    title: "QA automation engineer",
    description: "Improve product quality through exploratory and automated testing.",
    skills: ["testing", "JavaScript", "Python", "accessibility", "automation"],
    projects: ["Add browser tests to a small app.", "Write a test plan for one critical workflow."],
    resource: { name: "Playwright documentation", url: "https://playwright.dev/docs/intro" },
  },
];
