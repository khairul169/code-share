import type { Data } from "./+data";
import { useData } from "~/renderer/hooks";
import Link from "~/renderer/link";

const HomePage = () => {
  const { projects } = useData<Data>();

  return (
    <div>
      <h1>Posts</h1>

      {projects.map((project: any) => (
        <Link key={project.id} href={`/${project.slug}`}>
          {project.title}
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
