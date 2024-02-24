import React from "react";
import ProjectCard from "~/components/containers/project-card";
import trpc from "~/lib/trpc";

const ProjectsPage = () => {
  const { data: projects, isLoading } = trpc.project.getAll.useQuery({
    owned: true,
  });

  return (
    <main>
      <section id="browse" className="container max-w-5xl py-8 md:py-16">
        <h2 className="text-4xl font-medium border-b pb-3 mb-8 border-white/20">
          My Projects
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {isLoading
            ? [...Array(6)].map((_, idx) => <ProjectCard.Skeleton key={idx} />)
            : null}

          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProjectsPage;
