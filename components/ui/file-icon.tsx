import { FileSchema } from "~/server/db/schema/file";
import { ComponentProps } from "react";
import { FiFile, FiFolder } from "react-icons/fi";

type FileIconProps = {
  file: Pick<FileSchema, "filename" | "isDirectory">;
  className?: string;
};

const FileIcon = ({ file, className }: FileIconProps) => {
  const props: ComponentProps<"svg"> = {
    className,
  };

  if (file.isDirectory) {
    return <FiFolder {...props} />;
  }

  return <FiFile {...props} />;
};

export default FileIcon;
