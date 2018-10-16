# Azure Data Studio OpenId Extension

A sample project, demonstrating how to integrate OpenID Auth into Azure Data Studio Extension

![skeletonauth](https://user-images.githubusercontent.com/6816380/47018821-82af1780-d14d-11e8-98ab-8eb9e5f831ff.gif)

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

Create an [OAuth Github App](https://github.com/settings/developers).

In `auth-dex/config.yaml` fill in your connector values

```yaml
connectors:
    - type: github
      id: github
      name: GitHub
      config:
        clientID: <CLIENT_ID>
        redirectURI: http://127.0.0.1:80/callback
        clientSecret: <CLIENT_SECRET>

```

Build the docker image and run docker-compose

```bash
> pwd
sqlops-extension-openid/auth-dex
> docker-compose down
> docker build -f Dockerfile -t rgfoundry/dex:test .
> docker-compose up -d
```

## Using authentication in the extension

To test authentication you can try to sign in by using Command Palette: `Cmd/Ctrl + Shift + P: Sample OpenID: Sign in`.

Once you sign in you can try: `Cmd/Ctrl + Shift + P: Perform Restricted Action`.
