# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite with the --host flag so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]