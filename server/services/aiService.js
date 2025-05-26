import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const fetchPerplexityData = async (type, input, mainTopic, userProfile = {}) => {
  const API_KEY = process.env.PERPLEXITY_API_KEY;
  const BASE_URL = 'https://api.perplexity.ai';

  // Extract user profile details
  const { profession = 'unknown', experienceYears = 0 } = userProfile;

  let systemPrompt;
  switch (type) {
    case 'basicMindmap':
      systemPrompt = `
**System Instructions for Generating a Basic Mindmap**

You are an AI assistant **with web search capabilities**, tasked with creating a personalized learning mindmap/roadmap for a **${profession}** with **${experienceYears} years of experience**. The mindmap/roadmap must be tailored to the topic "${input}" and the user's professional background.

**Output Requirements:**
- Generate a hierarchical mindmap as a **strict matching JSON tree** with **exactly 10 nodes**, including multiple levels.
- The response must be a **valid JSON object** with a single key "nodes", containing an array of node objects.
- Each node object must have:
  - "data": { "label": "string", "shortDesc": "string" }
  - "parentIndex": number or null (null for the root node)
- The "label" must be **unique across all nodes**.
- The "shortDesc" must be concise and related to topic (10-20 words).

**Content Guidelines:**
- For < 2 years experience: Focus on **introductory concepts**.
- For 2-5 years: Include **intermediate topics**.
- For > 5 years: Add **advanced or specialized areas**.
- Ensure content is **relevant** to the user's profession and **accurate**.

**Important Notes:**
- **Do not include any text outside the JSON object.**
- **Avoid duplicate node labels.**
- **Use web search to verify information** and ensure accuracy.
- **Do not hallucinate or invent content.**

**Example Output:**
{
  "nodes": [
    {"data": {"label": "Root Topic", "shortDesc": "Overview of the topic"}, "parentIndex": null},
    {"data": {"label": "Child 1", "shortDesc": "Basic concept"}, "parentIndex": 0}
  ]
}
**Final Instruction:** Your entire response must be the **JSON object only**. No greetings or additional text.
`;
      break;
    case 'subtopics':
      systemPrompt = `
**System Instructions for Generating Subtopics**

You are an AI assistant **with web search capabilities**, helping a **${profession}** with **${experienceYears} years of experience** expand their learning mindmap on "${input}". Generate **2-5 subtopics related to the given topic and main topic is ${mainTopic}**.

**Output Requirements:**
- Provide a **strict matching JSON tree** with a "nodes" array.
- Each node must have:
  - "data": { "label": "string", "shortDesc": "string" }
  - "parentIndex": number or null (null for the first node)
- The first node must have **parentIndex: null**; others may point to their parent's index.

**Content Guidelines:**
- Tailor subtopics to the user's **profession** and **experience level**.
- Focus on **less common or advanced aspects** to ensure uniqueness.

**Important Notes:**
- **Do not include any text outside the JSON object.**
- **Ensure subtopics are unique and relevant. (do not repeat input topic itself)**
- **Use web search to verify information.**
- **Do not hallucinate or repeat typical topics.**

**Example Output:**
{
  "nodes": [
    {"data": {"label": "Subtopic 1", "shortDesc": "Advanced aspect"}, "parentIndex": null},
    {"data": {"label": "Sub-subtopic 1.1", "shortDesc": "Detail"}, "parentIndex": 0}
  ]
}
**Final Instruction:** Your entire response must be the **JSON object only**. No additional text.
`;
      break;
    case 'resources':
      systemPrompt = `
**System Instructions for Generating Learning Resources**

You are an Personalize AI assistant with web search capabilities, tasked with providing personalized learning resources for a user who may be a student or professional from any sector, with [experienceYears] years of experience. The subtopic topic is ${input} and main topic is ${mainTopic}.

**Output Requirements:**

- Provide a JSON object with a "resources" key containing:
  - "links": An array of objects, each with "url", "title", and "description". Include educational websites, official documentation, reputable blogs, and **project repositories** (e.g., GitHub links).
  - "images": An array of objects, each with "url", "alt", and "caption". URLs must be direct links to images.
  - "videos": An array of objects, each with "url", "title", and "description". Prefer YouTube videos or other educational video platforms.
  - "notes": An array of objects, each with "content". Notes should be concise summaries or key points.
  - "markdown": An array of objects, each with "content". Markdown must be **detailed,topic realted, well-structured, and include visuals like tables**. It should support **GitHub Flavored Markdown (GFM)** features such as headings, lists, code blocks, task lists, and footnotes. Include **project links** and other relevant web materials where appropriate.
 - "diagrams": An array containing exactly one object with:
    -- "content": A string representing a diagram in markmap-compatible text format (e.g., Markdown-like hierarchical syntax). The diagram must relate to the topic and include links and related points to deepen understanding.
    -- "format": Must be "markmap".
  - "codeSnippets": An array of objects, each with "content" and "language". Include relevant code examples where applicable.

- Ensure all resources are **accurate, up-to-date, and directly relevant** to the topic.
- Tailor the resources to the user's **profession** (if specified) and **experience level**:
  - For students or users with < 2 years of experience: Focus on **introductory and foundational resources**.
  - For professionals with 2-5 years of experience: Include **intermediate topics** and practical applications.
  - For experts with > 5 years of experience: Provide **advanced and specialized materials**.
- Make sure the resources are **accessible and, if possible, free**.
- Include a variety of resource types to cater to different learning preferences (e.g., visual learners, readers, etc.).

**Important Notes:**

- Do not include any text outside the JSON object.
- Use web search to verify all resources and ensure they are real, working, and relevant.
- Do not hallucinate or assume URLs; they must be actual working links.
- Ensure markdown content is **detailed and includes visuals like tables** where appropriate.
- Tailor the content to be understandable by a **broad audience**, including students and professionals from any sector.
- If no specific profession is provided, generate resources suitable for a general audience interested in learning about the topic.

**Example Output:**
{
  "resources": {
    "links": [
      {
        "url": "https://example.com/resource1",
        "title": "Resource 1 Title",
        "description": "A brief description of Resource 1."
      }
    ],
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "alt": "Image description",
        "caption": "Caption for the image"
      }
    ],
    "videos": [
      {
        "url": "https://youtube.com/watch?v=example",
        "title": "Video Title",
        "description": "A brief description of the video."
      }
    ],
    "notes": [
      {
        "content": "Key point or summary related to the topic."
      }
    ],
    "markdown": [
      {
        "content": "# Markdown Content\n\n## Key Points\n- Point 1\n- Point 2\n\n[Link to more resources](https://example.com)"
      }
    ],
    "diagrams": [
      {
        "content": "# Topic Overview\n- Main Point\n  - Subpoint 1\n  - Subpoint 2",
        "format": "markmap"
      }
    ],
    "codeSnippets": [
      {
        "content": "// Example code snippet",
        "language": "javascript"
      }
    ]
  }
}
`;
      break;
    case 'pdfSummary':
      systemPrompt = `
**System Instructions for Summarizing PDF Content**

You are an AI assistant **with web search capabilities**, summarizing PDF content for a **${profession}** with **${experienceYears} years of experience**. The input is the text content of a PDF about "${input}".

**Output Requirements:**
- Generate a **strict matching JSON tree** with a "nodes" array of **5-7 nodes**.
- Each node must have:
  - "data": { "label": "string", "shortDesc": "string" }
  - "parentIndex": number or null (null for the root node)

**Content Guidelines:**
- Tailor to the user's **profession** and **experience level**.
- Extract **key points** from the input text only.

**Important Notes:**
- **Do not include any text outside the JSON object.**
- **Avoid duplicate nodes.**
- **Base summary solely on input text; no external info.**
- **Do not hallucinate.**

**Example Output:**
{
  "nodes": [
    {"data": {"label": "Main Idea", "shortDesc": "Core concept"}, "parentIndex": null},
    {"data": {"label": "Point 1", "shortDesc": "Detail"}, "parentIndex": 0}
  ]
}
**Final Instruction:** Your entire response must be the **JSON object only**. No additional text.
`;
      break;
    case 'ytSummary':
      systemPrompt = `
**System Instructions for Summarizing YouTube Video**

You are an AI assistant **with web search capabilities**, summarizing a YouTube video for a **${profession}** with **${experienceYears} years of experience**. The input is the title or description: "${input}".

**Output Requirements:**
- Generate a **strict matching JSON tree** with a "nodes" array of **5-7 nodes**.
- Each node must have:
  - "data": { "label": "string", "shortDesc": "string" }
  - "parentIndex": number or null (null for the root node)

**Content Guidelines:**
- Tailor to the user's **profession** and **experience level**.
- Use **web search** if input is insufficient to gather video details.

**Important Notes:**
- **Do not include any text outside the JSON object.**
- **Avoid duplicate nodes.**
- **Ensure accuracy; no hallucinations.**

**Example Output:**
\`\`\`json
{
  "nodes": [
    {"data": {"label": "Overview", "shortDesc": "Video summary"}, "parentIndex": null},
    {"data": {"label": "Point 1", "shortDesc": "Key idea"}, "parentIndex": 0}
  ]
}
\`\`\`

**Final Instruction:** Your entire response must be the **JSON object only**. No additional text.
`;
      break;
    default:
      throw new Error('Invalid request type');
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: 'sonar-pro',
        messages,
        stream: false,
        web_search_options: {
          search_context_size: 'high',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.choices[0].message.content;
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', text);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Perplexity API error:', error.message, error.response?.data);
    throw new Error('Failed to fetch data from Perplexity');
  }
};

export const generateBasicMindmap = async (title, mainTopic, userProfile) => {
  const data = await fetchPerplexityData('basicMindmap', title, mainTopic, userProfile);
  return data; // Returns { nodes: [...] }
};

export const generateSubtopics = async (parentLabel, mainTopic, userProfile) => {
  const data = await fetchPerplexityData('subtopics', parentLabel, mainTopic, userProfile);
  return data; // Returns { nodes: [...] }
};

export const gatherResources = async (label, mainTopic, userProfile) => {
  const data = await fetchPerplexityData('resources', label, mainTopic, userProfile);
  return data; // Returns { resources: { links: [], images: [], ... } }
};

// export const summarizePDF = async (pdfContent, mainTopic, userProfile) => {
//   const data = await fetchPerplexityData('pdfSummary', pdfContent, mainTopic, userProfile);
//   return data; // Returns { nodes: [...] }
// };

// export const summarizeYouTube = async (videoInfo, mainTopic, userProfile) => {
//   const data = await fetchPerplexityData('ytSummary', videoInfo, mainTopic, userProfile);
//   return data; // Returns { nodes: [...] }
// };


// const generateBasicMindmap = async (title) => {
//   return {
//     nodes: [
//       { data: { label: title }, position: { x: 0, y: 0 }, parentIndex: null },
//       { data: { label: 'Cloud Models' }, position: { x: -400, y: 150 }, parentIndex: 0 },
//       { data: { label: 'Cloud Providers' }, position: { x: -200, y: 150 }, parentIndex: 0 },
//       { data: { label: 'Cloud Services' }, position: { x: 0, y: 150 }, parentIndex: 0 },
//       { data: { label: 'Security' }, position: { x: 200, y: 150 }, parentIndex: 0 },
//       { data: { label: 'Cost Management' }, position: { x: 400, y: 150 }, parentIndex: 0 },
//       { data: { label: 'IaaS' }, position: { x: -450, y: 300 }, parentIndex: 1 },
//       { data: { label: 'PaaS' }, position: { x: -350, y: 300 }, parentIndex: 1 },
//       { data: { label: 'AWS' }, position: { x: -250, y: 300 }, parentIndex: 2 },
//       { data: { label: 'Azure' }, position: { x: -150, y: 300 }, parentIndex: 2 },
//       // ... more Level 2 nodes
//     ],
//   };
// };

// const generateSubtopics = async (parentLabel) => {
//   const subtopics = {
//     'AWS': [
//       { data: { label: 'EC2' }, position: { x: 0, y: 150 }, parentIndex: null },
//       { data: { label: 'S3' }, position: { x: -100, y: 250 }, parentIndex: 0 },
//     ],
//     default: [
//       { data: { label: `${parentLabel} - Child 1` }, position: { x: 0, y: 150 }, parentIndex: null },
//       { data: { label: `${parentLabel} - Child 2` }, position: { x: -100, y: 250 }, parentIndex: 0 },
//     ],
//   };
//   return { nodes: subtopics[parentLabel] || subtopics.default };
// };

// const gatherResources = async (label) => {
//   const resources = {
//     'Cloud Computing': [
//       { type: 'link', url: 'https://aws.amazon.com/what-is-cloud-computing/', description: 'AWS Cloud Computing Guide' },
//       { type: 'note', description: 'Core concepts: IaaS, PaaS, SaaS, Scalability' },
//       {
//         type: 'markdown',
//         markdown: `# Cloud Computing Overview

// Cloud Computing delivers computing resources over the internet...

// ## Key Concepts

// - **IaaS**: Infrastructure as a Service, e.g., AWS EC2.
// - **PaaS**: Platform as a Service, e.g., Google App Engine.

// ## Tools

// - AWS
// - Azure
// - Google Cloud

// ## Resources

// - [Microsoft Azure Docs](https://docs.microsoft.com/en-us/azure/)
// `
//       },
//     ],
//     default: [
//       { type: 'link', url: 'https://example.com', description: `${label} Documentation` },
//       { type: 'note', description: `Key concept for ${label}` },
//       {
//         type: 'markdown',
//         markdown: `# ${label} Overview

// **${label}** is a topic in Cloud Computing...

// ## Resources

// - [Example Documentation](https://example.com)
// `
//       },
//     ],
//   };
//   return { resources: resources[label] || resources.default };
// };