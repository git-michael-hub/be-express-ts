# Use Node.js as the base image
FROM node:22.11.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install ts-node
# RUN npm install -g ts-node

# Copy the rest of the application code
COPY . .

# Compile TypeScript code
# RUN npm run build // production

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 80

# Define the command to run the application
# CMD ["node", "dist/main.js"]
