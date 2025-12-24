import { baseConfig, restrictEnvAccess } from "@finchat/eslint-config/base";
import { nextjsConfig } from "@finchat/eslint-config/nextjs";
import { reactConfig } from "@finchat/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
