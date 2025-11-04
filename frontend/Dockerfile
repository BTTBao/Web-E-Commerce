# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine AS final
# Copy các file static đã build vào thư mục web root của Nginx
COPY --from=build /app/dist /usr/share/nginx/html/
# Nginx mặc định chạy trên port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

