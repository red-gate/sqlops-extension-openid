# Azure Data Studio OpenId Extension

A sample project, demonstrating how to integrate OpenID Auth into Azure Data Studio Extension

## Prerequisites

* NodeJS
* [.NET Core](https://www.microsoft.com/net/download)
* [Docker](https://www.docker.com/get-started)
* [Docker Compose](https://docs.docker.com/compose/install/)

## How to run in Azure Data Studio

1. `cd extension`
1. `npm install`
1. `npm run package`
    * The `.vsix` will be saved to `extension/`
1. In Azure Data Studio, navigate to _File > Install Extension from VSIX Package_ and select the `.vsix` generated in the previous step
1. Reload Azure Data Studio

## How to run backend

```bash
> pwd
sqlops-extension-openid/backend/SqlOpsExtension.OpenID

> dotnet restore
> dotnet build
> dotnet run --project src/SqlOpsExtension.OpenID.WebApi/
```

## How to run Auth

```bash
> pwd
sqlops-extension-openid/auth-dex
> docker-compose down
> docker build -f Dockerfile -t rgfoundry/dex:test .
> docker-compose up -d
```

## Using authentication in the extension

To test authentication you can try to sign in by using Command Palette: `Cmd/Ctrl + Shift + P: Sample OpenID: Sign in`. This will prompt you to sing in and generate a token that will be displayed in the extension for you.