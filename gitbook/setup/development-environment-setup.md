---
description: Setup the dev environment and install base dependencies
---

# Development environment setup

The entire project will be developed in a mono-repository. It will allow us to easily test and integrate smart contracts into our app.&#x20;

## Requirements

* [NodeJS](https://nodejs.org/) v16.18 or later
* [octez-client](https://tezos.gitlab.io/introduction/howtoget.html), a Tezos client used by Completium
* Recommended: a Docker setup, to run a local blockchain sandbox
* Recommended: a good IDE ([Visual Studio Code](https://code.visualstudio.com/) is a good choice)

{% hint style="info" %}
Compatiblity between dependencies is quite fragile, especially with taquito and completium. It is advised to follow exact version requirements for JavaScript dependencies to avoid hard-to-troubleshoot errors.
{% endhint %}

## Installation

### Next.js

Use the create-next-app tool to setup the environment:

```
npx create-next-app@13.0.0 --typescript
```

The wizard will prompt for a few questions, answers are as follows:

> * What is your project named? … _**tzombies**_
> * Would you like to use ESLint with this project? <mark style="color:green;">**Yes**</mark>
> * Would you like to use Tailwind CSS with this project? <mark style="color:red;">**No**</mark>
> * Would you like to use `src/` directory with this project? <mark style="color:green;">**Yes**</mark>
> * Use App Router (recommended)? <mark style="color:green;">**Yes**</mark>
> * Would you like to customize the default import alias? <mark style="color:red;">**No**</mark>

Let's replace `npm` with `yarn` for faster iteration:

```bash
npm install --global yarn
rm package-lock.json
yarn install
```

{% hint style="info" %}
Some depedencies have issues with Next.js being executed on both the server and the client. To solve potential warnings, let's add this in the `nextConfig` object in `next.config.js`



```javascript
webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false }
    }
    return config
  }
```
{% endhint %}

{% hint style="info" %}
An [issue](https://github.com/ecadlabs/taquito/issues/2491) with Next and Taquito prevent the production build from working properly. While this issue is being fixed, a solution is to disable the `swc`minifier for prodution:&#x20;

In `next.config.js`, set&#x20;

```javascript
swcMinify: false
```
{% endhint %}

You can now start the development server with

```bash
yarn dev
```

It will automatically reload after editing files. Note that some changes (such as installing a package) still require restarting the server.&#x20;

To build for production

```bash
yarn build
yarn start # run a local server
```

### Material UI

[Material UI](https://mui.com/material-ui/getting-started/overview/) is a toolkit we'll use to design a standardised user interface. It takes care of styles, layouts, and comes with a set of common components, directly integrated with React.&#x20;

```bash
# base install
yarn add @mui/material@5.13.1 @emotion/react@11.11.0 @emotion/styled@11.11.0

# fonts and icons
yarn add @fontsource/roboto@5.0.0 @mui/icons-material@5.11.16

# peer dependencies from x-date-pickers
yarn add @mui/base@5.0.0-beta.1 @mui/system@5.13.1

# mui-x date picker and luxon date manager
yarn add @mui/x-date-pickers@6.5.0
yarn add luxon@3.3.0 
yarn add --dev @types/luxon@3.3.0
```

### Tezos tooling

Let's now install Archetype's tools:

```bash
yarn add --dev @completium/completium-cli@0.4.77
yarn add @completium/dapp-ts@0.1.11
```

Completium CLI is a command-line interface that we'll use to build, deploy and interact with our smart contracts. It relies on `octez-client` which need to be installed separately.&#x20;

Smart contract interaction in your app will rely on taquito and Beacon:

```bash
yarn add @taquito/taquito@16.1.2 @taquito/beacon-wallet@16.1.2 

# peer dependencies
yarn add @taquito/michel-codec@16.1.2 @taquito/michelson-encoder@16.1.2 @taquito/signer@16.1.2 @taquito/utils@16.1.2
```

### Extras

I recommend using a prettier and set it up with your IDE to keep a clean and coherent code base:&#x20;

```bash
yarn add --dev prettier@2.7.1
```
