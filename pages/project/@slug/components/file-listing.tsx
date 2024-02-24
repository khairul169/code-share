import { Fragment, useMemo, useState } from "react";
import { UseDiscloseReturn, useDisclose } from "~/hooks/useDisclose";
import {
  FiChevronRight,
  FiFilePlus,
  FiFolderPlus,
  FiMoreVertical,
} from "react-icons/fi";
import { FaCheck, FaThumbtack } from "react-icons/fa";
import trpc from "~/lib/trpc";
import type { FileSchema } from "~/server/db/schema/file";
import CreateFileDialog, { CreateFileSchema } from "./createfile-dialog";
import ActionButton from "../../../../components/ui/action-button";
import { useEditorContext } from "../context/editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { cn, getPreviewUrl, getUrl, copy } from "~/lib/utils";
import FileIcon from "~/components/ui/file-icon";
import { useData } from "~/renderer/hooks";
import Spinner from "~/components/ui/spinner";
import { Data } from "../+data";
import { settingsDialog } from "../stores/dialogs";

const FileListing = () => {
  const { project, files: initialFiles } = useData<Data>();
  const { onOpenFile, onFileChanged } = useEditorContext();
  const createFileDlg = useDisclose<CreateFileSchema>();
  const files = trpc.file.getAll.useQuery(
    { projectId: project.id },
    { initialData: initialFiles }
  );

  const fileList = useMemo(() => groupFiles(files.data, null), [files.data]);

  return (
    <Fragment>
      <div className="h-10 flex items-center pl-4 pr-1">
        <p className="text-xs uppercase truncate flex-1">{project.title}</p>
        <ActionButton
          icon={FiFilePlus}
          onClick={() => createFileDlg.onOpen()}
        />

        <ActionButton
          icon={FiFolderPlus}
          onClick={() =>
            createFileDlg.onOpen({ isDirectory: true, filename: "" })
          }
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ActionButton icon={FiMoreVertical} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Upload File</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => settingsDialog.setState(true)}>
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Download Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {files.isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col items-stretch flex-1 overflow-y-auto">
          {fileList.map((file) => (
            <FileItem key={file.id} file={file} createFileDlg={createFileDlg} />
          ))}
        </div>
      )}

      <CreateFileDialog
        disclose={createFileDlg}
        onSuccess={(file, type) => {
          files.refetch();

          if (type === "create" && !file.isDirectory && !file.isFile) {
            onOpenFile && onOpenFile(file.id);
          }
          if (onFileChanged) {
            onFileChanged(file);
          }
        }}
      />
    </Fragment>
  );
};

type TFile = Omit<FileSchema, "content"> & { children: TFile[] };

type FileItemProps = {
  file: TFile;
  createFileDlg: UseDiscloseReturn<CreateFileSchema>;
};

const FileItem = ({ file, createFileDlg }: FileItemProps) => {
  const { project } = useData<Data>();
  const { onOpenFile, onDeleteFile } = useEditorContext();
  const [isCollapsed, setCollapsed] = useState(false);
  const trpcUtils = trpc.useUtils();

  const updateFile = trpc.file.update.useMutation({
    onSuccess() {
      trpcUtils.file.getAll.invalidate();
    },
  });

  return (
    <div className="w-full">
      <div className="group text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm flex items-stretch relative w-full h-10">
        <button
          className="flex items-center pl-5 pr-3 gap-1 w-full text-left"
          onClick={() => {
            if (file.isDirectory) {
              setCollapsed((i) => !i);
            } else {
              onOpenFile(file.id);
            }
          }}
        >
          {file.isDirectory ? (
            <FiChevronRight
              className={cn(
                "absolute left-1 top-3 transition-transform",
                isCollapsed ? "rotate-90" : ""
              )}
            />
          ) : null}

          <FileIcon file={file} />
          <span className="flex-1 truncate">{file.filename}</span>

          {file.isPinned ? <FaThumbtack /> : null}
        </button>

        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 pr-1 h-full bg-slate-700">
          {file.isDirectory ? (
            <>
              <ActionButton
                icon={FiFilePlus}
                onClick={() =>
                  createFileDlg.onOpen({ parentId: file.id, filename: "" })
                }
              />

              <ActionButton
                icon={FiFolderPlus}
                onClick={() =>
                  createFileDlg.onOpen({
                    parentId: file.id,
                    isDirectory: true,
                    filename: "",
                  })
                }
              />
            </>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionButton icon={FiMoreVertical} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => createFileDlg.onOpen(file)}>
                Rename
              </DropdownMenuItem>
              {/* <DropdownMenuItem>Duplicate</DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => onDeleteFile(file.id)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => copy(file.filename)}>
                Copy Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copy(file.path)}>
                Copy Path
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copy(getPreviewUrl(project, file, { raw: true }))
                }
              >
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    getPreviewUrl(project, file, { raw: true }),
                    "_blank"
                  )
                }
              >
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  copy(getUrl(project.slug + `?files=${file.path}`))
                }
              >
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  return updateFile.mutate({
                    id: file.id,
                    isPinned: !file.isPinned,
                  });
                }}
              >
                Pinned
                {file.isPinned ? <FaCheck className="ml-auto" /> : null}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isCollapsed && file.children?.length > 0 ? (
        <div className="flex flex-col items-stretch pl-4">
          {file.children.map((file) => (
            <FileItem key={file.id} file={file} createFileDlg={createFileDlg} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

function groupFiles(files?: any[] | null, parentId?: number | null) {
  if (!files) {
    return [];
  }
  const groupedFiles: TFile[] = [];

  files.forEach((file) => {
    if (file.parentId !== parentId) {
      return;
    }
    groupedFiles.push(file);
    if (file.isDirectory) {
      file.children = groupFiles(files, file.id);
    }
  });

  return groupedFiles;
}

export default FileListing;
