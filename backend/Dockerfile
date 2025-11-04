# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# ASP.NET Core mặc định chạy trên 8080 trong container
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"] 
# (Tên file .dll của bạn, dựa trên 'using backend.Data')