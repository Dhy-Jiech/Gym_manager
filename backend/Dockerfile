FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
Run npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Start the server
EXPOSE 3000
CMD ["npm", "start"]
