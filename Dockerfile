# Use the official Bun image as the base image
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the application code
COPY . .

# Install dependencies
RUN bun install

# Build the app
RUN bun run web:build

# Expose the port the app runs on
EXPOSE 2611

# Command to run the application
CMD ["bun", "web:deploy"]