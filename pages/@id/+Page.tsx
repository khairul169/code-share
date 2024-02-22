import { useData } from "~/renderer/hooks";
import { Data } from "./+data";
import Link from "~/renderer/link";

const ViewPostPage = () => {
  const { post } = useData<Data>();

  return (
    <div>
      <Link href="/">Go Back</Link>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  );
};

export default ViewPostPage;
