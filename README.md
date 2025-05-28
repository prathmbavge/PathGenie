
# Path Genie

Welcome to  **Path Genie** ! 🎉 Your ultimate companion for creating personalized learning journeys. Whether you're diving into "Learn Python Programming" or exploring "Quantum Physics," Path Genie transforms your topic of interest into a vibrant, interactive learning path. Using the magic of  **React Flow** , we visualize your learning milestones, and with the power of  **Perplexity's Sonar API** , we fetch top-notch resources like YouTube videos, blogs, and articles to supercharge your learning experience. Let's embark on this adventure together! 🚀

## Table of Contents

* [Features]()
* [Tech Stack]()
* [Demo]()
* [Prerequisites]()
* [Installation]()
* [Configuration]()
* [Usage]()
* [Project Structure]()
* [Contributing]()
* [Acknowledgements]()

## Features

* 🌟  **Dynamic Learning Paths** : Watch your topic transform into a structured, interactive journey with React Flow.
* 📚  **Resource Integration** : Get the best learning materials handpicked by Perplexity's Sonar API.
* 🖱️  **User-Friendly Interface** : Effortlessly enter topics and navigate your visual path.
* ✏️  **Customizable Paths** : Tweak nodes and connections to make the path truly yours.
* 📱  **Responsive Design** : Learn on the go, whether on desktop or mobile.

## Tech Stack

* 🖥️  **Frontend** : React, React Flow (for those awesome visual paths)
* 🛠️  **Backend** : Node.js, Express
* 🗄️  **Database** : MongoDB (keeping your data safe)
* 🔌  **API** : Sonar API by Perplexity (your resource genie)
* 🔐  **Authentication** : Better Auth (email/password & GitHub SSO)
* 🎨  **Styling** : Tailwind CSS (looking sharp!)
* ⚙️  **Others** : Vite, Mongoose, Axios (the behind-the-scenes heroes)

## Demo

Try out Path Genie live at [https://pathgenie.onrender.com/](https://pathgenie.onrender.com/). Use the following dummy credentials to explore:

* **Email** : [testuser@gmail.com](testuser@gmail.com)
* **Password** : Password@2025

Feel free to create your own account too! 😊

## Prerequisites

Before you start, make sure you have:

* 🟢 Node.js (v18 or later)
* 🟢 MongoDB (local or cloud, like MongoDB Atlas)
* 🟢 Git
* 🟢 A Perplexity Sonar API key (grab it from [Perplexity AI](https://www.perplexity.ai/))
* 🟢 A GitHub OAuth app (for that smooth SSO login)

## Installation

1. **Clone the Repository** :

```bash
   git clone <your-private-repo-url>
   cd path-genie
```

2. **Install Dependencies** :

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

3. **Set Up MongoDB** :

* Make sure MongoDB is up and running (locally or on the cloud).
* Update the `MONGODB_URI` in the backend `.env` file (details in [Configuration](https://grok.com/chat/9a382970-2097-4d7c-ae75-a29e5d78d103#configuration)).

## Configuration

Create a `.env` file in the `server` directory with:

```bash
PORT=8000
BETTER_AUTH_SECRET=your_secret_here  # Generate with `openssl rand -base64 32`
BETTER_AUTH_URL=http://localhost:8000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
MONGODB_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:8000
PERPLEXITY_API_KEY=your_perplexity_api_key
NODE_ENV=development
```

Create a `.env` file in the `client` directory with:

```bash
VITE_SERVER_URL=http://localhost:8000
VITE_CLIENT_URL=http://localhost:5173
VITE_MODE=development
```

> **Note** : For production, set `NODE_ENV=production` in the backend `.env` and `VITE_MODE=production` in the frontend `.env`.

## Usage

1. **Fire Up the Backend** 🔥:

```bash
   cd server
   npm run start
```

Your backend will be live at `http://localhost:8000`.

2. **Launch the Frontend** 🚀:

```bash
   cd client
   npm run dev
```

Head to `http://localhost:5173` to see the magic!

3. **Explore Path Genie** 🌟:

* Visit `http://localhost:5173` and log in (or sign up) with email/password or GitHub.
* Type in a topic like "Learn Python Programming" and hit enter.
* Watch as Path Genie crafts a beautiful learning path with React Flow.
* Click on nodes to discover curated resources from Perplexity's Sonar API.

4. **Make It Yours** ✏️:

* Drag nodes around to customize your path.
* Dive into resources by clicking on nodes.
* Save your progress or export your path (coming soon!).

## Project Structure

```
path-genie/
├── client/                     # Frontend (React)
│   ├── src/
│   │   ├── api/                # API-related code
│   │   ├── assets/             # Static assets
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Auth client setup (Better Auth)
│   │   ├── Pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   ├── index.css           # Global styles
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Public assets
│   │   ├── pathgenie.png
│   │   └── vite.svg
│   ├── .env                    # Frontend environment variables
│   ├── .env.sample
│   ├── .gitignore
│   ├── constants.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── reactFlowBestPractices.md
│   └── vite.config.js
├── server/                     # Backend (Node.js/Express)
│   ├── config/                 # Configuration files
│   │   └── config.js
│   ├── controllers/            # Controller functions
│   │   ├── mindmapController.js
│   │   └── userController.js
│   ├── db/                     # Database connection
│   │   └── index.js
│   ├── lib/                    # Auth setup (Better Auth)
│   │   └── auth.js
│   ├── middlewares/            # Middleware functions
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Service functions
│   ├── utils/                  # Utility functions
│   ├── app.js                  # Express app setup
│   ├── constants.js
│   ├── index.js                # Server entry point
│   ├── Working.md
│   ├── workingOfEdge.md
│   ├── .env                    # Backend environment variables
│   ├── .env.sample
│   ├── .gitignore
│   └── package.json
├── README.md                   # You're here! 👋
└── package.json                # Project metadata and scripts
```

## Contributing

We welcome contributions to Path Genie! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description of your changes.

Please follow our Code of Conduct and ensure your code adheres to the project’s style guidelines (e.g., ESLint, Prettier).

## Acknowledgements

* [React Flow](https://reactflow.dev/) for the interactive flow-based UI.
* [Perplexity Sonar API](https://www.perplexity.ai/) for providing learning resources.
* [Better Auth](https://www.better-auth.com/) for secure authentication.
* [Mongoose](https://mongoosejs.com/) for MongoDB integration.
* The open-source community for their invaluable tools and resources.

---

**Path Genie** is built to empower learners by making education accessible and engaging. Start creating your learning path today!
