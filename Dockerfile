# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies
RUN npm install -g pnpm && \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    else npm ci; fi

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
