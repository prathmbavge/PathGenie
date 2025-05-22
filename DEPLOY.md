
#### Render.com Deployment Setup

1. **Push to Git Repository**:

   - Ensure your project is in a Git repository (e.g., on GitHub).
   - Commit all files, including `client/.env`, `vite.config.js`, `server/index.js`, and the root `package.json`.
2. **Create a Web Service on Render.com**:

   - Log in to Render.com and create a new **Web Service**.
   - Connect your Git repository.
   - Configure the service:
     - **Runtime**: Node
     - **Build Command**: `npm run build`
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

#### Testing Locally

To simulate the production setup locally:

```bash
cd C:\Users\omana\Desktop\pathgenie
npm run deploy
```

This installs dependencies, builds the client, and starts the server. Access `http://localhost:8000` to verify that:

- The React app loads.
- API calls (e.g., `fetch('/api/some-endpoint')`) work.
- `signIn.social` redirects to `/dashboard` or `/profile` (relative URLs).

#### Development vs. Production

- **Development**:
  - `VITE_MODE=development` in `client/.env`.
  - Vite runs on `http://localhost:5173`, proxying `/api` to `http://localhost:8000` (via `vite.config.js`).
  - `signIn.social` uses full URLs (e.g., `http://localhost:5173/dashboard`).
- **Production**:
  - `VITE_MODE=production` (set in Render’s environment variables).
  - Client static files and server APIs are served on the same port/domain (e.g., `https://your-app.onrender.com`).
  - `signIn.social` uses relative URLs (e.g., `/dashboard`).

#### Additional Notes

- **.env.production**: If you want to test production locally, create a `client/.env.production` file:
  ```
  VITE_MODE=production
  ```

  Run `npm run build` in `client/` and `npm run start` in the root to test.
- **Render.com Port**: Render assigns a dynamic port via `process.env.PORT`. Ensure your server uses this (as shown in `index.js`).
- **CORS**: In production, CORS is not an issue since the client and server share the same domain. In development, the Vite proxy handles this.
- **File Paths**: Adjust `path.join(__dirname, '..', 'client', 'dist')` in `server/index.js` if your project structure differs.

If you encounter issues during deployment (e.g., Render logs showing errors), share the error messages, and I’ll help debug. Let me know if you need further customization for Render or other deployment platforms!
