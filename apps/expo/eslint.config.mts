import { baseConfig } from "@finchat/eslint-config/base";
import { reactConfig } from "@finchat/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
