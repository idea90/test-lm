module.exports = {
  apps: [
    {
      name: "test-lm-backend",
      script: "uvicorn",
      args: "app:app --host 0.0.0.0 --port 5000 --workers 4",
      interpreter: "python", // change to python3 or path/to/venv/bin/python if needed
      env: {
        NODE_ENV: "production",
        SECRET_KEY: "replace-with-your-secure-secret-key",
      }
    },
    {
      name: "test-lm-frontend",
      cwd: "./next-app",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        BACKEND_URL: "http://localhost:5000"
      }
    }
  ]
};
