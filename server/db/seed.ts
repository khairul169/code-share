import db from ".";
import { hashPassword } from "../lib/crypto";
import { uid } from "../lib/utils";
import { file } from "./schema/file";
import { project } from "./schema/project";
import { user } from "./schema/user";

const main = async () => {
  const [adminUser] = await db
    .insert(user)
    .values({
      name: "Admin",
      email: "admin@mail.com",
      password: await hashPassword("123456"),
    })
    .returning();

  const [vanillaProject] = await db
    .insert(project)
    .values({
      userId: adminUser.id,
      slug: uid(),
      title: "Vanilla Project",
      visibility: "public",
    })
    .returning();

  // vanilla html css js template
  await db
    .insert(file)
    .values([
      {
        projectId: vanillaProject.id,
        path: "index.html",
        filename: "index.html",
        content: "<p>Hello world!</p>",
        isPinned: true,
      },
      {
        projectId: vanillaProject.id,
        path: "styles.css",
        filename: "styles.css",
        content: "body { padding: 16px; }",
        isPinned: true,
      },
      {
        projectId: vanillaProject.id,
        path: "scripts.js",
        filename: "scripts.js",
        content: "console.log('hello world!');",
        isPinned: true,
      },
      {
        projectId: vanillaProject.id,
        path: "_layout.html",
        filename: "_layout.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    {CONTENT}
    <script src="scripts.js"></script>
  </body>
</html>`,
      },
    ])
    .execute();

  const [reactProject] = await db
    .insert(project)
    .values({
      userId: adminUser.id,
      slug: uid(),
      title: "React Project",
      visibility: "public",
      settings: {
        css: {
          preprocessor: "postcss",
          tailwindcss: true,
        },
        js: {
          transpiler: "swc",
          packages: [
            { name: "react", url: "https://esm.sh/react@18.2.0" },
            {
              name: "react-dom/client",
              url: "https://esm.sh/react-dom@18.2.0/client",
            },
          ],
        },
      },
    })
    .returning();

  // react template
  await db
    .insert(file)
    .values([
      {
        projectId: reactProject.id,
        path: "index.html",
        filename: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>React + Tailwind Template</title>
    <link rel="stylesheet" href="globals.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="index.jsx" type="module" defer></script>
  </body>
</html>
`,
      },
      {
        projectId: reactProject.id,
        path: "globals.css",
        filename: "globals.css",
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply p-4;
}
`,
      },
      {
        projectId: reactProject.id,
        path: "index.jsx",
        filename: "index.jsx",
        content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = createRoot(document.getElementById("app"));
root.render(<App />);
`,
      },
      {
        projectId: reactProject.id,
        path: "App.jsx",
        filename: "App.jsx",
        isPinned: true,
        content: `import React from "react";

const App = () => {
  return (
    <div>
      <h1 class="text-xl font-medium text-blue-500">
        React + Tailwind Template!
      </h1>
      <p>Open App.jsx to edit this text.</p>
    </div>
  );
};

export default App;
`,
      },
    ])
    .execute();

  process.exit();
};

main();
