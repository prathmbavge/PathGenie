# Path Genie

Path Genie is an interactive web application that helps users create personalized learning paths based on a topic of interest. By entering a title (e.g., "Learn Python Programming"), users can generate a detailed, visual learning path using the **React Flow** library. The application leverages the **Sonar API by Perplexity** to fetch relevant learning resources, including YouTube videos, blogs, articles, and more, to enrich the learning experience.

## Table of Contents

* [Features](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#features)
* [Tech Stack](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#tech-stack)
* [Prerequisites](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#prerequisites)
* [Installation](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#installation)
* [Configuration](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#configuration)
* [Usage](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#usage)
* [Project Structure](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#project-structure)
* [Contributing](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#contributing)
* [License](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#license)
* [Acknowledgements](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#acknowledgements)

## Features

* **Dynamic Learning Paths** : Generate structured, interactive learning paths using React Flow based on user-provided topics.
* **Resource Integration** : Fetch curated learning resources (YouTube videos, blogs, articles) via the Sonar API by Perplexity.
* **User-Friendly Interface** : Intuitive UI for entering topics and exploring visual paths.
* **Customizable Paths** : Users can modify nodes and edges in the learning path.
* **Responsive Design** : Optimized for both desktop and mobile devices.

## Tech Stack

* **Frontend** : React, React Flow (for visualizing learning paths)
* **Backend** : Node.js, Express
* **Database** : MongoDB (for storing user data and paths, if applicable)
* **API** : Sonar API by Perplexity (for fetching learning resources)
* **Authentication** : Better Auth (with Mongoose adapter, email/password, and GitHub SSO)
* **Styling** : Tailwind CSS
* **Others** : Vite (build tool), Mongoose (MongoDB ORM), Axios (API requests)

## Prerequisites

Before setting up Path Genie, ensure you have the following installed:

* Node.js (v18 or later)
* MongoDB (local or cloud, e.g., MongoDB Atlas)
* Git
* A Perplexity Sonar API key (sign up at [Perplexity AI](https://www.perplexity.ai/))
* A GitHub OAuth app (for SSO authentication)

## Installation

1. **Clone the Repository** :

```bash
   git clone https://github.com/your-username/path-genie.git
   cd path-genie
```

1. **Install Dependencies** :

* For the backend:
  ```bash
  cd server
  npm install
  ```
* For the frontend:
  ```bash
  cd client
  npm install
  ```

1. **Set Up MongoDB** :

* Ensure MongoDB is running locally or use a cloud instance (e.g., MongoDB Atlas).
* Update the `MONGODB_URI` in the backend `.env` file (see [Configuration](https://grok.com/chat/2dc7c0f0-5431-4729-9db1-4942faaf2a6f#configuration)).

## Configuration

Create a `.env` file in the `server` directory with the following environment variables:

```
PORT=8000
BETTER_AUTH_SECRET=your_random_secret_value
BETTER_AUTH_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
MONGODB_URI=mongodb://localhost:27017/path_genie
SONAR_API_KEY=your_perplexity_sonar_api_key
```

Create a `.env` file in the `client` directory (if needed for frontend-specific variables):

```
VITE_API_URL=http://localhost:8000
VITE_SONAR_API_KEY=your_perplexity_sonar_api_key
```

* **BETTER_AUTH_SECRET** : Generate a random string (e.g., `openssl rand -base64 32`).
* **GITHUB_CLIENT_ID/SECRET** : Obtain from your GitHub OAuth app settings.
* **MONGODB_URI** : Your MongoDB connection string.
* **SONAR_API_KEY** : Obtain from Perplexity AI for the Sonar API.

## Usage

1. **Start the Backend** :

```bash
   cd server
   npm run dev
```

   The backend will run on `http://localhost:8000`.

1. **Start the Frontend** :

```bash
   cd client
   npm run dev
```

   The frontend will run on `http://localhost:5173` (Vite default).

1. **Access the Application** :

* Open `http://localhost:5173` in your browser.
* Sign up or log in using email/password or GitHub SSO.
* Enter a topic (e.g., "Learn Python Programming") in the input field.
* Path Genie will generate a visual learning path using React Flow, with nodes representing learning milestones.
* Each node may include resources (YouTube videos, blogs, etc.) fetched via the Sonar API.

1. **Interact with the Path** :

* Drag and drop nodes to reorganize the path.
* Click nodes to view associated resources.
* Save or export your learning path (if implemented).

## Project Structure

```
path-genie/
├── client/                     # Frontend (React)
│   ├── src/
│   │   ├── components/         # React components (e.g., FlowCanvas, ResourceList)
│   │   ├── lib/                # Auth client setup (Better Auth)
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   └── .env                    # Frontend environment variables
├── server/                     # Backend (Node.js/Express)
│   ├── lib/                    # Auth setup (Better Auth)
│   ├── routes/                 # API routes (e.g., protectedRoutes.js)
│   ├── db/                     # Database connection (Mongoose)
│   ├── utils/                  # Utilities (e.g., logger, asyncHandler)
│   ├── middlewares/            # Middleware (e.g., errorHandler)
│   ├── app.js                  # Express app setup
│   ├── index.js                # Server entry point
│   └── .env                    # Backend environment variables
├── README.md                   # Project documentation
└── package.json                # Project metadata and scripts
```

## Contributing

We welcome contributions to Path Genie! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description of your changes.

Please follow the [Code of Conduct](https://grok.com/chat/CODE_OF_CONDUCT.md) and ensure your code adheres to the project’s style guidelines (e.g., ESLint, Prettier).

## License

This project is licensed under the MIT License. See the [LICENSE](https://grok.com/chat/LICENSE) file for details.

## Acknowledgements

* [React Flow](https://reactflow.dev/) for the interactive flow-based UI.
* [Perplexity Sonar API](https://www.perplexity.ai/) for providing learning resources.
* [Better Auth](https://www.better-auth.com/) for secure authentication.
* [Mongoose](https://mongoosejs.com/) for MongoDB integration.
* The open-source community for their invaluable tools and resources.

---

**Path Genie** is built to empower learners by making education accessible and engaging. Start creating your learning path today!
