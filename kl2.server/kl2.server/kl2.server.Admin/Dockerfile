FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["kl2.server.Admin/kl2.server.Admin.csproj", "kl2.server.Admin/"]
RUN dotnet restore "kl2.server.Admin/kl2.server.Admin.csproj"
COPY . .
WORKDIR "/src/kl2.server.Admin"
RUN dotnet build "kl2.server.Admin.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "kl2.server.Admin.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "kl2.server.Admin.dll"]