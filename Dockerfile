FROM oven/bun AS build

# Set the working directory
WORKDIR /app

# Copy the package.json into the container
COPY package.json package.json

# Install dependencies using bun
RUN bun install

# Copy the rest of the Svelte app into the container
COPY . .

# Build the Svelte app
RUN bun run build

# Use a lightweight Nginx image as the base image for the final image
FROM nginx:1.27.1
# Copy the built app from the Build stage to the Nginx web server
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 so that the container can be accessed from the host
EXPOSE 80

# Start the Nginx web server
CMD ["nginx", "-g", "daemon off;"]
