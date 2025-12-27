## Quick Start

To get it running, follow the steps below:

### Pre-requisites

Make sure you have bun installed globally. If not, you can install it by running:

```bash
npm install -g bun
```

Make sure you are using the specified node version in .nvmrc. You can use nvm (recommended) to manage your node versions. To use the correct node version, run:

```bash
nvm use
```

### 1. Setup dependencies

```bash
# Install dependencies
bun i
```

### 2. Fetch secrets using infisical

This project uses infisical to manage secrets. Make sure you have the infisical CLI installed and configured. You can install it by running:

```bash
bun install -g @infisical/cli
```

Then, log in to infisical by running:

```bash
infisical login
```

Then, fetch the secrets by running:
```bash
bun pull-secrets
```

### 3. Push the database schema to the local database

```bash
bun db:push
```

### 4. Start the development server (nextjs + studio + database)

```bash
bun dev
```


### 5. Most helpful commands

```bash
# Clean all temporary files in all packages
turbo clean

# Run Biome checks on all packages
bun check

# Run Biome checks and write all packages
bun format

#Run type checking on all packages
bun tsc

# Start the main app + studio + database
bun dev

# Pushing the Drizzle schema to the database
bun db:push

# Create a new package
bun turbo gen init
```

