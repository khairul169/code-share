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

  await db
    .insert(file)
    .values([
      {
        userId: adminUser.id,
        path: "index.html",
        filename: "index.html",
        content: '<p class="text-lg text-red-500">Hello world!</p>',
      },
      {
        userId: adminUser.id,
        path: "styles.css",
        filename: "styles.css",
        content: "body { padding: 16px; }",
      },
      {
        userId: adminUser.id,
        path: "script.js",
        filename: "script.js",
        content: "console.log('hello world!');",
      },
      {
        userId: adminUser.id,
        path: "_layout.html",
        filename: "_layout.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="styles.css">

    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    {CONTENT}
    <script src="script.js" type="module" defer></script>
  </body>
</html>`,
      },
    ])
    .execute();

  process.exit();
};

main();
