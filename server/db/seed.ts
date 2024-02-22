import db from ".";
import { hashPassword } from "../lib/crypto";
import { file } from "./schema/file";
import { user } from "./schema/user";

const main = async () => {
  const [adminUser] = await db
    .insert(user)
    .values({
      email: "admin@mail.com",
      password: await hashPassword("123456"),
    })
    .returning();

  //   await db
  //     .insert(file)
  //     .values([
  //       {
  //         userId: adminUser.id,
  //         path: "index.html",
  //         filename: "index.html",
  //         content: '<p class="text-lg text-red-500">Hello world!</p>',
  //       },
  //       {
  //         userId: adminUser.id,
  //         path: "styles.css",
  //         filename: "styles.css",
  //         content: "body { padding: 16px; }",
  //       },
  //       {
  //         userId: adminUser.id,
  //         path: "script.js",
  //         filename: "script.js",
  //         content: "console.log('hello world!');",
  //       },
  //       {
  //         userId: adminUser.id,
  //         path: "_layout.html",
  //         filename: "_layout.html",
  //         content: `<!DOCTYPE html>
  // <html lang="en">
  //   <head>
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <title>Document</title>

  //     <link rel="stylesheet" href="styles.css">

  //     <script src="https://cdn.tailwindcss.com"></script>
  //   </head>
  //   <body>
  //     {CONTENT}
  //     <script src="script.js" type="module" defer></script>
  //   </body>
  // </html>`,
  //       },
  //     ])
  //     .execute();

  // react template
  await db
    .insert(file)
    .values([
      {
        userId: adminUser.id,
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
        userId: adminUser.id,
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
        userId: adminUser.id,
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
        userId: adminUser.id,
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
