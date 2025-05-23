import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const fetchPerplexityData = async (type, input, userProfile = {}) => {
  const API_KEY = process.env.PERPLEXITY_API_KEY;
  const BASE_URL = 'https://api.perplexity.ai';

  // Extract user profile details
  const { profession = 'unknown', experienceYears = 0 } = userProfile;

  let systemPrompt;
  switch (type) {
  case 'basicMindmap':
    systemPrompt = `
**System Instructions for Generating a Basic Mindmap**

You are an AI assistant **with web search capabilities**, tasked with creating a personalized learning mindmap for a **${profession}** with **${experienceYears} years of experience**. The mindmap must be tailored to the topic "${input}" and the user's professional background.

**Output Requirements:**
- Generate a hierarchical mindmap as a **strict matching JSON tree** with **exactly 10 nodes**, including multiple levels.
- The response must be a **valid JSON object** with a single key "nodes", containing an array of node objects.
- Each node object must have:
  - "data": { "label": "string", "shortDesc": "string" }
  - "parentIndex": number or null (null for the root node)
- The "label" must be **unique across all nodes**.
- The "shortDesc" must be concise (10-20 words).

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

You are an AI assistant **with web search capabilities**, helping a **${profession}** with **${experienceYears} years of experience** expand their learning mindmap on "${input.toString()}". Generate **2-5 unique subtopics**.

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

You are an AI assistant **with web search capabilities**, providing personalized resources for a **${profession}** with **${experienceYears} years of experience** on "${input.toString()}". Generate **at least one** of each resource type.

**Output Requirements:**
- Provide a **strict matching JSON tree** with a "resources" key containing:
  - "links": [{ "url": "string", "title": "string", "description": "string" }]
  - "images": [{ "url": "string", "alt": "string", "caption": "string" }]
  - "videos": [{ "url": "string", "title": "string", "description": "string" }]
  - "notes": [{ "content": "string" }]
  - "markdown": [{ "content": "string" }]
- URLs must be **real, working, and authorized** (images as direct links, videos as YouTube links).

**Content Guidelines:**
- Tailor to the user's **profession** and **experience level**.
- Markdown must be **detailed and well-structured** (e.g., headings, lists).

**Important Notes:**
- **Do not include any text outside the JSON object.**
- **Use web search to verify all resources.**
- **Do not hallucinate or assume URLs; they must be real.**
- **Ensure accuracy and relevance.**

**Example Output:**
{
  "resources": {
    "links": [{"url": "https://example.com", "title": "Guide", "description": "Useful link"}],
    "images": [{"url": "https://example.com/img.jpg", "alt": "Diagram", "caption": "Visual aid"}],
    "videos": [{"url": "https://youtube.com/watch?v=abc", "title": "Tutorial", "description": "Video"}],
    "notes": [{"content": "Key takeaway"}],
    "markdown": [{"content": "# Overview\nDetails here."}]
  }
}
**Final Instruction:** Your entire response must be the **JSON object only**. No additional text.
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
\`\`\`json
{
  "nodes": [
    {"data": {"label": "Main Idea", "shortDesc": "Core concept"}, "parentIndex": null},
    {"data": {"label": "Point 1", "shortDesc": "Detail"}, "parentIndex": 0}
  ]
}
\`\`\`

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

export const generateBasicMindmap = async (title, userProfile) => {
  const data = await fetchPerplexityData('basicMindmap', title, userProfile);
  return data; // Returns { nodes: [...] }
};

export const generateSubtopics = async (parentLabel, userProfile) => {
  const data = await fetchPerplexityData('subtopics', parentLabel, userProfile);
  return data; // Returns { nodes: [...] }
};

export const gatherResources = async (label, userProfile) => {
  const data = await fetchPerplexityData('resources', label, userProfile);
  return data; // Returns { resources: { links: [], images: [], ... } }
};

export const summarizePDF = async (pdfContent, userProfile) => {
  const data = await fetchPerplexityData('pdfSummary', pdfContent, userProfile);
  return data; // Returns { nodes: [...] }
};

export const summarizeYouTube = async (videoInfo, userProfile) => {
  const data = await fetchPerplexityData('ytSummary', videoInfo, userProfile);
  return data; // Returns { nodes: [...] }
};


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