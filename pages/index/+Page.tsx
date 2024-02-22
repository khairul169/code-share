import type { Data } from "./+data";
import { useData } from "~/renderer/hooks";
import Link from "~/renderer/link";

const HomePage = () => {
  const { posts } = useData<Data>();

  if (!posts?.length) {
    return <p>No posts.</p>;
  }

  return (
    <div>
      <h1>Posts</h1>

      {posts.map((post: any) => (
        <Link key={post.id} href={`/${post.id}`}>
          {post.title}
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
