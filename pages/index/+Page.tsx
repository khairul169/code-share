import { Button } from "~/components/ui/button";
import type { Data } from "./+data";
import { useData } from "~/renderer/hooks";
import Link from "~/renderer/link";
import Footer from "~/components/containers/footer";
import ProjectCard from "~/components/containers/project-card";

const HomePage = () => {
  const { projects } = useData<Data>();

  return (
    <>
      <main>
        <section className="container py-8 md:py-16 min-h-dvh md:min-h-[80vh] flex items-center justify-center flex-col text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-transparent bg-gradient-to-b from-gray-200 to-gray-100 bg-clip-text">
            Create and Share Web Snippets
          </h1>
          <p className="text-lg mt-8 md:mt-12 text-gray-300">
            Collaborate with Ease, Share with the World
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center mt-8 md:mt-12">
            <Button href="/get-started" size="lg">
              Getting Started
            </Button>
            <Button href="#browse" size="lg" variant="outline">
              Browse Projects
            </Button>
          </div>
        </section>

        <section id="browse" className="container max-w-5xl py-8 md:py-16">
          <h2 className="text-4xl font-medium border-b pb-3 mb-8 border-white/20">
            Community Projects
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
