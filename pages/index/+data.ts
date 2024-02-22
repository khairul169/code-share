export const data = async () => {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=20"
  ).then((response) => response.json());

  return { posts };
};

export type Data = Awaited<ReturnType<typeof data>>;
