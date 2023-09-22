# Use the official Node.js image as the base image
FROM node:20.7.0 AS Build

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml files into the container
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the Svelte app into the container
COPY . .

# Build the Svelte app
RUN pnpm run build

# Use a lightweight Nginx image as the base image for the final image
FROM nginx:1.25.0
# Copy the built app from the Build stage to the Nginx web server
COPY --from=Build /app/dist /usr/share/nginx/html

# Expose port 80 so that the container can be accessed from the host
EXPOSE 80

# Start the Nginx web server
CMD ["nginx", "-g", "daemon off;"]
