import { Briefcase, BookOpen, Cpu, TrendingUp } from 'lucide-react';

export const INTERNSHIPS = [
    { id: 1, title: "PM Internship Scheme", org: "MCA (Govt of India)", domain: "All Graduates", link: "https://www.pminternship.mca.gov.in/" },
    { id: 2, title: "DPIIT Internship", org: "Commerce Ministry", domain: "Policy/Admin", link: "https://dpiit.gov.in/internship" },
    { id: 3, title: "Digital India Internship", org: "MeitY", domain: "Tech/IT", link: "https://www.meity.gov.in/digital-india-internship-scheme" },
    { id: 4, title: "NITI Aayog Internship", org: "NITI Aayog", domain: "Policy Research", link: "https://www.niti.gov.in/internship" },
    { id: 5, title: "RBI Summer Internship", org: "Reserve Bank of India", domain: "Finance/Eco", link: "https://opportunities.rbi.org.in/" },
    { id: 6, title: "ISRO Student Project", org: "ISRO", domain: "Engineering", link: "https://www.isro.gov.in/CapacityBuilding.html" },
    { id: 7, title: "Google STEP Intern", org: "Google India", domain: "CSE 1st/2nd Year", link: "https://buildyourfuture.withgoogle.com/programs/step" },
    { id: 8, title: "Microsoft Explore", org: "Microsoft India", domain: "Early Tech", link: "https://careers.microsoft.com/students" },
    { id: 9, title: "NALSA Internship", org: "Legal Services Auth.", domain: "Law Students", link: "https://nalsa.gov.in/internship" },
    { id: 10, title: "Nestlé Nesternship", org: "Nestlé India", domain: "Marketing/FMCG", link: "https://www.nestle.in/jobs/nesternship" },
    { id: 11, title: "Portals to find 100+", org: "Internshala / Indeed", domain: "Local/Remote", link: "https://internshala.com/" },
    { id: 12, title: "Winter/Summer TULIP", org: "MoHUA / AICTE", domain: "Smart Cities", link: "https://tulip.aicte-india.org/" }
];

export const COURSES = [
    // 1. Indian Government & Top IIT/IIM Courses
    { id: 1, title: "Machine Learning for Soil & Crop", provider: "IIT Kharagpur", domain: "AI/Agriculture", link: "https://swayam.gov.in/", category: "Government" },
    { id: 2, title: "User Interface (UI) Design", provider: "IIT Roorkee", domain: "Design/Tech", link: "https://swayam.gov.in/", category: "Government" },
    { id: 3, title: "Real-Time Operating Systems", provider: "IIT Kharagpur", domain: "Computer Science", link: "https://swayam.gov.in/", category: "Government" },
    { id: 4, title: "Financial Accounting", provider: "IIT Mandi", domain: "Commerce/Finance", link: "https://swayam.gov.in/", category: "Government" },
    { id: 5, title: "English Grammar for Employability", provider: "AICTE", domain: "Communication", link: "https://swayam.gov.in/", category: "Government" },
    { id: 6, title: "Blockchain & Applications", provider: "IIT Kharagpur", domain: "Web3/Tech", link: "https://swayam.gov.in/", category: "Government" },
    { id: 7, title: "Media, Information & Empowerment", provider: "IGNOU", domain: "Social Science", link: "https://swayam.gov.in/", category: "Government" },

    // 2. Global Tech Giant Courses
    { id: 8, title: "Intro to Generative AI", provider: "Google Cloud", domain: "AI Basics", link: "https://www.cloudskillsboost.google/", category: "Tech Giant" },
    { id: 9, title: "Google Analytics Certification", provider: "Google", domain: "Data Marketing", link: "https://skillshop.withgoogle.com/", category: "Tech Giant" },
    { id: 10, title: "Azure Fundamentals (AZ-900)", provider: "Microsoft", domain: "Cloud Computing", link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", category: "Tech Giant" },
    { id: 11, title: "Project Management Simplified", provider: "LinkedIn", domain: "Productivity", link: "https://www.linkedin.com/learning/", category: "Tech Giant" },
    { id: 12, title: "Introduction to Cybersecurity", provider: "IBM / Cisco", domain: "Security", link: "https://skillsbuild.org/", category: "Tech Giant" },
    { id: 13, title: "Responsive Web Design", provider: "freeCodeCamp", domain: "Web Development", link: "https://www.freecodecamp.org/", category: "Tech Giant" },
    { id: 14, title: "Elements of AI", provider: "Univ. of Helsinki", domain: "AI Literacy", link: "https://www.elementsofai.com/", category: "Tech Giant" },

    // 3. Prestigious University Courses
    { id: 15, title: "CS50: Intro to Computer Science", provider: "Harvard Univ.", domain: "Programming", link: "https://pll.harvard.edu/course/cs50-introduction-computer-science", category: "University" },
    { id: 16, title: "The Science of Well-Being", provider: "Yale Univ.", domain: "Mental Health", link: "https://www.coursera.org/learn/the-science-of-well-being", category: "University" },
    { id: 17, title: "Machine Learning", provider: "Stanford Univ.", domain: "AI/Math", link: "https://www.coursera.org/specializations/machine-learning-introduction", category: "University" },
    { id: 18, title: "English for Career Development", provider: "Univ. of Penn", domain: "Communication", link: "https://www.coursera.org/learn/careerdevelopment", category: "University" },
    { id: 19, title: "Introduction to Finance", provider: "IIM Bangalore", domain: "Finance", link: "https://swayam.gov.in/", category: "University" }
];

export const AI_TOOLS = [
    { id: 1, name: "Google Gemini", purpose: "Research & Images", tip: "Integrated with Google Workspace", link: "https://gemini.google.com/" },
    { id: 2, name: "ChatGPT (OpenAI)", purpose: "Explanations", tip: "Great for simplifying NCERT/JEE", link: "https://chat.openai.com/" },
    { id: 3, name: "Perplexity AI", purpose: "Verifying Facts", tip: "Cites sources like Indian news", link: "https://www.perplexity.ai/" },
    { id: 4, name: "Socratic (Google)", purpose: "School Homework", tip: "Scan your textbook for help", link: "https://socratic.org/" },
    { id: 5, name: "Photomath", purpose: "Step-by-Step Math", tip: "Best for Boards/JEE prep", link: "https://photomath.com/" },
    { id: 6, name: "QuillBot", purpose: "Rewriting & Summaries", tip: "Summarize long Indian Law/Articles", link: "https://quillbot.com/" },
    { id: 7, name: "Canva AI", purpose: "Design & PPTs", tip: "Templates for Indian festivals", link: "https://www.canva.com/" },
    { id: 8, name: "GitHub Copilot", purpose: "Coding Projects", tip: "Free via Student Developer Pack", link: "https://github.com/features/copilot" },
    { id: 9, name: "Otter.ai", purpose: "Lecture Notes", tip: "Record & transcribe lectures", link: "https://otter.ai/" },
    { id: 10, name: "Gamma.app", purpose: "Instant Slides", tip: "Text-to-PPT for college projects", link: "https://gamma.app/" },
    { id: 11, name: "Hugging Face / Kaggle", purpose: "AI/ML Learning", tip: "Free GPU access for ML projects", link: "https://kaggle.com/" }
];
