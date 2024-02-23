import { Button } from "~/components/ui/button";
import type { Data } from "./+data";
import { useData } from "~/renderer/hooks";
import Link from "~/renderer/link";
import Footer from "~/components/containers/footer";

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
              <Link
                key={project.id}
                href={`/${project.slug}`}
                className="border border-white/20 hover:border-white/40 rounded-lg transition-colors overflow-hidden"
              >
                <div className="w-full aspect-[3/2] bg-gray-900"></div>
                <div className="py-2 px-3 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-white/80"></div>
                  <div>
                    <p className="text-md truncate">{project.title}</p>
                    <p className="text-xs truncate">{project.user.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
