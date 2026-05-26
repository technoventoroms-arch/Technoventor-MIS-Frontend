import CanIUse from "@/components/shared/can-i-use";
import { Button } from "@mono/shared_ui/components/ui/button";
import { IProjectsGetAll } from "@mono/shared_ui/interfaces/projects";
import { CellContext } from "@tanstack/react-table";
import { Edit2Icon, Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const ProjectTableAction = ({
  table,
  row,
}: CellContext<IProjectsGetAll, any>) => {
  const handleEditProject = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editProject?.(row.original);
  };
  const handleDeleteProject = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteProject?.(row.original);
  };
  return (
    <div className="flex gap-2">
      <Button
        onClick={handleEditProject}
        variant={"indigo"}
        className="rounded size-6 "
        size={"icon"}
        title="Edit project"
      >
        <Edit2Icon className="size-3" />
      </Button>
      <CanIUse action={(a) => a.DELETE_PROJECTS}>
        <Button
          onClick={handleDeleteProject}
          variant={"red"}
          className="rounded size-6"
          size={"icon"}
          title="Delete Project"
        >
          <Trash className="size-3" />
        </Button>
      </CanIUse>
    </div>
  );
};

export default ProjectTableAction;
