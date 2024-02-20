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

  await db.insert(file).values([
    {
      userId: adminUser.id,
      path: "index.html",
      filename: "index.html",
      content: "<p>Hello world!</p>",
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
  ]);

  process.exit();
};

main();
