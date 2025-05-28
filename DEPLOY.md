#### Render.com Deployment Setup

1. **Push to Git Repository**:

   - Ensure your project is in a Git repository (e.g., on GitHub).
   - Commit all files, including `client/.env`, `vite.config.js`, `server/index.js`, and the root `package.json`.
2. **Create a Web Service on Render.com**:

   - Log in to Render.com and create a new **Web Service**.
   - Connect your Git repository.
   - Configure the service:

     - **Runtime**: Node
     - **Build Command**: `npm run install:all && npm run build`
     - **Start Command**: `npm run start`
     - **Root Directory**: Leave blank if `package.json` is in the root, or specify `pathgenie` if it’s nested.
   - Add environment variables in Render’s dashboard:

     ```
     VITE_MODE=production
     ```
     - `VITE_SERVER_URL` and `VITE_CLIENT_URL` are not needed in production since the client and server share the same domain (e.g., `https://your-app.onrender.com`). The `signIn.social` code uses relative URLs (`/dashboard`, `/profile`) in production.
3. **Deploy**:

   - Push changes to your repository, and Render will automatically run the build and start commands.
   - Render assigns a port (accessible via `process.env.PORT`), and your app will be available at a URL like `https://your-app.onrender.com`.
