import { Project, ProjectStatus } from "@/src/types/components/projects/projects-list";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function postProcessProjectsList(projects: Project[]): Project[] {
    if (!projects) return [];
    const projectsProcessed: Project[] = projects.filter(a => a.status != ProjectStatus.IN_DELETION && a.status != ProjectStatus.HIDDEN)
        .map((project: Project) => {
            const projectItemCopy = { ...project };
            projectItemCopy.timeStamp = parseUTC(projectItemCopy.createdAt);
            const splitDateTime = projectItemCopy.timeStamp.split(',');
            projectItemCopy.date = splitDateTime[0].trim();
            projectItemCopy.time = splitDateTime[1];
            return projectItemCopy;
        });
    return projectsProcessed.sort((a, b) => a.name.localeCompare(b.name));;
}