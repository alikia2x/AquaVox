# Use the official Bun image as the base image
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and bun.lockb files to the working directory
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the app
RUN bun run build

# Expose the port the app runs on
EXPOSE 4173

# Command to run the application
CMD ["bun", "go"]
