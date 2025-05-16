import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const fetchPerplexityData = async (type, input) => {
  const API_KEY = process.env.PERPLEXITY_API_KEY; // Ensure this is set in your environment
  const BASE_URL = 'https://api.perplexity.ai';

  let systemPrompt;
  switch (type) {
    case 'basicMindmap':
      systemPrompt = `
Generate an initial mindmap structure for the given topic in JSON format. The JSON should have a "nodes" array, where each node is an object with:
- "data": { "label": "node label" }
- "position": { "x": number, "y": number }
- "parentIndex": number or null
The root node should have parentIndex: null, and other nodes should have parentIndex pointing to the index of their parent in the nodes array.
Provide at least 10 nodes with a hierarchical structure, including multiple levels.
Assign positions such that nodes are arranged in a tree layout, with the root at (0,0), level 1 at y=100, level 2 at y=200, etc., and spaced horizontally by 100 units. The response should be only valid JSON object(**No Other text**).
`;
      break;
    case 'subtopics':
      systemPrompt = `
Generate subtopics for the given parent node label in JSON format. The JSON should have a "nodes" array, where each node is an object with:
- "data": { "label": "node label" }
- "position": { "x": number, "y": number }
- "parentIndex": number or null
The first node should have parentIndex: null (it will connect to the parent), and subsequent nodes can have parentIndex pointing to the index of their parent in the nodes array.
Provide 2-3 subtopics.
Assign positions such that nodes are positioned below the parent, e.g., y=150 for the first node, y=250 for others, with x offsets of 100 units. The response should be only valid JSON object(**No Other text**).
`;
      break;
    case 'resources':
      systemPrompt = `
Generate learning resources for the given topic in JSON format. The JSON should have a "resources" array, where each resource is an object with:
- "type": ['links', 'images', 'markdown','videoUrls', 'note']
- "url": array of strings (for "links" and "images" and "videoUrls" types)
- "description": string for the resource description
- "markdown": string (for "markdown" type, provide detailed markdown content with headings, lists, and code blocks)
Provide at least (min) one link, one note, one image and one video and one detailed markdown resource for the topic.
Ensure the markdown is properly formatted for JavaScript template literals. The response should be only valid JSON object(**No any pre or post Other text**).
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

export const generateBasicMindmap = async (title) => {
  const data = await fetchPerplexityData('basicMindmap', title);
  return data; // Returns { nodes: [...] }
};

export const generateSubtopics = async (parentLabel) => {
  const data = await fetchPerplexityData('subtopics', parentLabel);
  return data; // Returns { nodes: [...] }
};

export const gatherResources = async (label) => {
  const data = await fetchPerplexityData('resources', label);
  return data; // Returns { resources: [...] }
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