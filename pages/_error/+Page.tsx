import { usePageContext } from "~/renderer/context";

const Page = () => {
  const pageContext = usePageContext();
  let { abortReason } = pageContext;

  if (!abortReason) {
    abortReason = pageContext.is404
      ? "Page not found."
      : "Something went wrong.";
  }

  return (
    <div>
      <p style={{ fontSize: "1.3em" }}>{abortReason}</p>
    </div>
  );
};

export default Page;
