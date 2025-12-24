import { baseConfig, restrictEnvAccess } from "@finchat/eslint-config/base";
import { reactConfig } from "@finchat/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [".nitro/**", ".output/**", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  restrictEnvAccess,
);
