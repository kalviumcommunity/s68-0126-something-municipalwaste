# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies based on lockfile if available
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile || npm install

# Copy project files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
