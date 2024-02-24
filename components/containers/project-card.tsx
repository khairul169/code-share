import Link from "~/renderer/link";
import type { ProjectSchema } from "~/server/db/schema/project";
import type { UserSchema } from "~/server/db/schema/user";
import { Skeleton } from "../ui/skeleton";

type Props = {
  project: Omit<ProjectSchema, "settings"> & {
    user: UserSchema;
  };
};

const ProjectCard = ({ project }: Props) => {
  return (
    <Link
      key={project.id}
      href={`/${project.slug}`}
      className="border border-white/20 hover:border-white/40 rounded-lg transition-colors overflow-hidden"
    >
      <img
        src={`/api/thumbnail/${project.slug}`}
        className="w-full aspect-[3/2] bg-background object-cover"
      />

      <div className="py-2 px-3 flex items-center gap-3">
        <div className="size-8 rounded-full bg-white/80"></div>
        <div>
          <p className="text-md truncate">{project.title}</p>
          <p className="text-xs truncate">{project.user.name}</p>
        </div>
      </div>
    </Link>
  );
};

const ProjectCardSkeleton = () => (
  <div>
    <Skeleton className="w-full aspect-[3/2]" />
    <div className="py-2 flex items-center gap-3">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4 mt-2" />
      </div>
    </div>
  </div>
);

ProjectCard.Skeleton = ProjectCardSkeleton;

export default ProjectCard;
