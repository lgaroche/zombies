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
* For VSCode, the following extensions are recommended:
  * [Archetype](https://marketplace.visualstudio.com/items?itemName=edukera.archetype)
  * [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  * [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

{% hint style="info" %}
Compatiblity between dependencies is quite fragile, especially with taquito and completium. It is advised to follow exact version requirements for JavaScript dependencies to avoid hard-to-troubleshoot errors.
{% endhint %}

## Installation

### Next.js

Use the create-next-app tool to setup the environment:

```bash
npx create-next-app@13.2.0 --typescript
```

An installation wizard will prompt for a few questions. Answer as follows:

* What is your project named? … _**tzombies**_
* Would you like to use ESLint with this project? <mark style="color:green;">**Yes**</mark>
* Would you like to use `src/` directory with this project? <mark style="color:green;">**Yes**</mark>
* Would you like to use experimental `app/` directory with this project? <mark style="color:red;">**No**</mark>
* What import alias would you like configured? <mark style="color:green;">**@/\***</mark>

Let's replace `npm` with `yarn` for faster iteration:

```bash
cd tzombies
npm install --global yarn
rm package-lock.json
yarn install
```

At some point down the tutorial, we'll use some features that require a change in TypeScript compiler configuration. In `tsconfig.json`, change `target` and `module` values to match:

```json
"compilerOptions": {
    "target": "es6",
    [...]
    "module": "commonJS",
    [...]
}
```

{% hint style="info" %}
Some dependencies have issues with Next.js being executed on both the server and the client. To prevent these problems, let's add this in the `nextConfig` object in `next.config.js:`

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
An [issue](https://github.com/ecadlabs/taquito/issues/2491) with Next and Taquito prevent the production build from working properly. While this issue is being fixed, a solution is to disable the`swc`minifier for prodution:&#x20;

In `next.config.js`, set&#x20;

```javascript
swcMinify: false
```
{% endhint %}

{% hint style="info" %}
There might be CORS issues when the app needs to communicate with the sandbox node. To work around this issue, we'll configure a proxy on the next development server, that will redirect requests to the node. In `next.config.js`, add this to the `nextConfig` object:

```javascript
rewrites: async () => [
  {
    source: "/sandbox/:path*",
    destination: "http://localhost:20000/:path*",
  },
],
```
{% endhint %}

You can now start the development server with

```bash
yarn dev
```

It will automatically reload after editing files. Note that some changes (such as installing a package) still require restarting the server.&#x20;

### Material UI

[Material UI](https://mui.com/material-ui/getting-started/overview/) is a toolkit we'll use to design a standardised user interface. It takes care of styles, layouts, and comes with a set of common components, directly integrated with React.\
\
If you open a new terminal, be sure to navigate to the tzombies directory with `cd tzombies` before running the following commands:&#x20;

<pre class="language-bash"><code class="lang-bash"><strong># base install
</strong>yarn add @mui/material@5.13.1 @emotion/react@11.11.0 @emotion/styled@11.11.0

# fonts and icons
yarn add @fontsource/roboto@5.0.0 @mui/icons-material@5.11.16

# peer dependencies from x-date-pickers
yarn add @mui/base@5.0.0-beta.1 @mui/system@5.13.1

# mui-x date picker and luxon date manager
yarn add @mui/x-date-pickers@6.5.0
yarn add luxon@3.3.0 
yarn add --dev @types/luxon@3.3.0
</code></pre>

### Wert Tools <a href="#wert-tools" id="wert-tools"></a>

[Wert.io](https://wert.io/) is a credit card crypto payment platform. It enables crypto on-ramp and credit card NFT purchase on Tezos. It can be tested for free on a testnet. Contact their sales team for more pricing information if you consider an integration with Wert.

Install Wert packages with the following commands:

```bash
yarn add @wert-io/widget-initializer
yarn add @wert-io/widget-sc-signer
```

### Tezos tooling

Let's now install Archetype's tools:

```bash
yarn add --dev @completium/completium-cli@0.4.77
yarn add @completium/dapp-ts@0.1.11
```

Completium CLI is a command-line interface we will use to build, deploy and interact with our smart contracts. `octez-client` must be pre-installed (see [Requirements](development-environment-setup.md#requirements) section)

Smart contract interaction in your app will rely on taquito and Beacon:yarn add @taquito/taquito@16.1.2 @taquito/beacon-wallet@16.1.2

## peer dependencies

yarn add @taquito/michel-codec@16.1.2 @taquito/michelson-encoder@16.1.2 @taquito/signer@16.1.2 @taquito/utils@16.1.2

```bash
yarn add @taquito/taquito@16.1.2 @taquito/beacon-wallet@16.1.2 

# peer dependencies
yarn add @taquito/michel-codec@16.1.2 @taquito/michelson-encoder@16.1.2 @taquito/signer@16.1.2 @taquito/utils@16.1.2
```

### Extras (optional)

I recommend using prettier with your IDE to maintain a clean and coherent code base. Check the documentation of your IDE to see how it can be integrated. For VSCode, the [extension documentation](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) is exhaustive. The `formatOnSave` feature is quite a time-saver!

```bash
yarn add --dev prettier@2.7.1
```
