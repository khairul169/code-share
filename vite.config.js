import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import path from "path";

const config = {
  plugins: [react(), vike()],
  resolve: {
    alias: {
      "~": path.resolve("./"),
    },
  },
  server: {
    watch: {
      ignored: [path.resolve(__dirname, "storage/**")],
    },
  },
};

export default config;
