# Use the official Node.js image as the base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy the Node.js app into the container
COPY . .

# Install dependencies
RUN npm install
EXPOSE 3009
# Set the command to start the Node.js app
CMD ["npm", "start"]