Based on the provided backend structure in `mindmapController.js`, I'll create the corresponding frontend API functions for interacting with the mindmap-related endpoints. These functions will use `axiosInstance` for HTTP requests and integrate with the `requestHandler` utility for managing loading states and error handling. I'll also provide examples of how to use these API functions in React components.

---

### Frontend API Functions

First, I'll define the API functions in a file called `mindmapApi.js`. These functions correspond to the backend endpoints defined in `mindmapController.js`.

```javascript
// mindmapApi.js
import axiosInstance from './axiosInstance';

export const createMindmap = async (title) => {
  const response = await axiosInstance.post('/mindmaps', { title });
  return response.data;
};

export const getMindmap = async (mindmapId) => {
  const response = await axiosInstance.get(`/mindmaps/${mindmapId}`);
  return response.data;
};

export const expandNode = async (mindmapId, nodeId) => {
  const response = await axiosInstance.post(`/mindmaps/${mindmapId}/nodes/${nodeId}/expand`);
  return response.data;
};

export const getNodeResources = async (mindmapId, nodeId) => {
  const response = await axiosInstance.get(`/mindmaps/${mindmapId}/nodes/${nodeId}/resources`);
  return response.data;
};

export const updateNode = async (mindmapId, nodeId, data) => {
  const response = await axiosInstance.put(`/mindmaps/${mindmapId}/nodes/${nodeId}`, data);
  return response.data;
};

export const deleteNode = async (mindmapId, nodeId) => {
  const response = await axiosInstance.delete(`/mindmaps/${mindmapId}/nodes/${nodeId}`);
  return response.data;
};

export const updateMindmap = async (mindmapId, data) => {
  const response = await axiosInstance.put(`/mindmaps/${mindmapId}`, data);
  return response.data;
};
```

#### Explanation of API Functions

- **`createMindmap`**: Sends a `POST` request to `/mindmaps` with a `title` to create a new mindmap.
- **`getMindmap`**: Sends a `GET` request to `/mindmaps/:mindmapId` to fetch a mindmap, including its nodes and edges.
- **`expandNode`**: Sends a `POST` request to `/mindmaps/:mindmapId/nodes/:nodeId/expand` to generate subtopics for a node.
- **`getNodeResources`**: Sends a `GET` request to `/mindmaps/:mindmapId/nodes/:nodeId/resources` to fetch or gather resources for a node.
- **`updateNode`**: Sends a `PUT` request to `/mindmaps/:mindmapId/nodes/:nodeId` with updated data (e.g., `data`, `position`, `status`).
- **`deleteNode`**: Sends a `DELETE` request to `/mindmaps/:mindmapId/nodes/:nodeId` to remove a node.
- **`updateMindmap`**: Sends a `PUT` request to `/mindmaps/:mindmapId` with updated mindmap details (e.g., `title`, `tags`, `visibility`).

---

### Usage in React Components

Below are examples of how to use these API functions in React components, integrating with the provided `requestHandler` utility for managing loading states, success, and error handling.

#### 1. Creating a Mindmap

```javascript
import { createMindmap } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const handleCreateMindmap = async (title, setLoading, setMindmap, setError) => {
  await requestHandler(
    () => createMindmap(title),
    setLoading,
    (res) => {
      setMindmap(res.data); // { mindmap, nodes, edges }
      showSuccessToast(res.message); // "Mindmap created"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

#### 2. Fetching a Mindmap

```javascript
import { getMindmap } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const fetchMindmap = async (mindmapId, setLoading, setMindmap, setError) => {
  await requestHandler(
    () => getMindmap(mindmapId),
    setLoading,
    (res) => {
      setMindmap(res.data); // { mindmap, nodes, edges }
      showSuccessToast(res.message); // "Mindmap fetched"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

#### 3. Expanding a Node

```javascript
import { expandNode } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const handleExpandNode = async (mindmapId, nodeId, setLoading, setNewNodes, setError) => {
  await requestHandler(
    () => expandNode(mindmapId, nodeId),
    setLoading,
    (res) => {
      setNewNodes(res.data); // { newNodes, edges }
      showSuccessToast(res.message); // "Node expanded"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

#### 4. Fetching Node Resources

```javascript
import { getNodeResources } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const fetchNodeResources = async (mindmapId, nodeId, setLoading, setResources, setError) => {
  await requestHandler(
    () => getNodeResources(mindmapId, nodeId),
    setLoading,
    (res) => {
      setResources(res.data.resources);
      showSuccessToast(res.message); // "Resources fetched" or "Resources gathered"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

#### 5. Updating a Node

```javascript
import { updateNode } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const handleUpdateNode = async (mindmapId, nodeId, data, setLoading, setNode, setError) => {
  await requestHandler(
    () => updateNode(mindmapId, nodeId, data),
    setLoading,
    (res) => {
      setNode(res.data.node);
      showSuccessToast(res.message); // "Node updated"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

#### 6. Deleting a Node

```javascript
import { deleteNode } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const handleDeleteNode = async (mindmapId, nodeId, setLoading, onSuccess, setError) => {
  await requestHandler(
    () => deleteNode(mindmapId, nodeId),
    setLoading,
    (res) => {
      onSuccess();
      showSuccessToast(res.message); // "Node deleted"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

#### 7. Updating a Mindmap

```javascript
import { updateMindmap } from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const handleUpdateMindmap = async (mindmapId, data, setLoading, setMindmap, setError) => {
  await requestHandler(
    () => updateMindmap(mindmapId, data),
    setLoading,
    (res) => {
      setMindmap(res.data.mindmap);
      showSuccessToast(res.message); // "Mindmap updated"
    },
    (error) => {
      setError(error.message);
    }
  );
};
```

---

### Notes on Integration

- **`axiosInstance`**: Assumes a pre-configured Axios instance (e.g., with base URL and authentication headers) is imported from `./axiosInstance`.
- **`requestHandler`**: The provided utility function is used to wrap API calls, manage loading states, and handle success/error cases. It assumes `showSuccessToast` and `showErrorToast` are defined elsewhere for UI feedback.
- **Error Handling**: Errors from the backend (e.g., `ApiError`) are caught and passed to the `setError` callback for display in the UI.
- **Response Data**: Each function returns `response.data`, which aligns with the `ApiResponse` structure from the backend (e.g., `{ success, data, message }`).

---

### Example Usage in a React Component

Here’s how you might use these functions in a React component:

```javascript
import React, { useState, useEffect } from "react";
import {
  createMindmap,
  getMindmap,
  expandNode,
  updateNode,
} from "../api/mindmapApi";
import { requestHandler } from "../utils/requestHandler";

const MindmapComponent = ({ mindmapId }) => {
  const [mindmap, setMindmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch mindmap on mount
  useEffect(() => {
    if (mindmapId) {
      fetchMindmap(mindmapId, setLoading, setMindmap, setError);
    }
  }, [mindmapId]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {mindmap && (
        <>
          <h1>{mindmap.mindmap.title}</h1>
          <button
            onClick={() =>
              handleExpandNode(mindmapId, mindmap.nodes[0]._id, setLoading, (data) => {
                setMindmap({ ...mindmap, nodes: [...mindmap.nodes, ...data.newNodes] });
              }, setError)
            }
          >
            Expand Root Node
          </button>
        </>
      )}
      <button
        onClick={() =>
          handleCreateMindmap("New Mindmap", setLoading, setMindmap, setError)
        }
      >
        Create Mindmap
      </button>
    </div>
  );
};

export default MindmapComponent;
```

---

This setup provides a complete frontend solution for interacting with the mindmap-related backend endpoints, ensuring consistency with the provided `requestHandler` pattern and proper error handling. Let me know if you need further clarification or additional examples!
