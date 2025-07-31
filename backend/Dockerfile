FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY backend.csproj .
RUN dotnet restore

COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=publish /app/publish .

EXPOSE 8080

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "backend.dll"] 