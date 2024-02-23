import Link from "~/renderer/link";
import Logo from "./logo";

const Footer = () => {
  return (
    <footer className="py-12 md:py-24 border-t border-white/20">
      <div className="container max-w-5xl grid md:grid-cols-2 gap-x-4 gap-y-6">
        <div>
          <Logo size="lg" />
          <p className="text-sm mt-3 text-white/80">
            Create, Collaborate, and Share your web design or snippets with
            ease.
          </p>
        </div>
        <div>
          <p>Links</p>
          <ul className="mt-4 text-sm space-y-2 text-white/80">
            <li>
              <Link href="#" className="hover:text-white">
                Terms and Condition
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
