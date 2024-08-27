# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code
COPY src ./src
COPY .env .env

# Expose the port the app runs on
EXPOSE 4001

# Command to run the app
CMD ["node", "src/app.js"] 