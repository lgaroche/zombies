---
description: Completium-cli installation and usage
---

# Completium

Completium is a set of tools to support smart contract development with the [Archetype language](https://archetype-lang.org/). We installed completium in the previous section, but it must be initialised.

{% hint style="info" %}
Running `npx completium-cli` will run the locally installed completium client interface package. For convenience, the command can be aliased with:

```bash
alias ccli="npx completium-cli"
```

Then, subsequent calls to `ccli` are shorthands for `npx completium-cli`
{% endhint %}

```bash
ccli init
```

This will create the local configuration and default accounts.&#x20;

### Sandbox

A sandbox is a local simulated blockchain for testing and development purposes.

Completium-cli uses the `oxheadalpha/flextesa` container with a single node and bootstrapped accounts. With Docker running, ensure you have an up-to-date sandbox container:

```bash
docker pull oxheadalpha/flextesa:latest
```

Start the blockchain sandbox:

```bash
ccli start sandbox
```

## Useful commands

Start/stop the sandbox container (a new blockchain will be created at each restart)

```bash
ccli start sandbox
ccli stop sandbox
```

Switch environments (sandbox, ghostnet...)

```bash
ccli switch endpoint
```

Switch account (used for next call):

```bash
ccli switch account
```

Other commands will explained throughout the tutorial. You can always refresh your memory with `ccli help`.
