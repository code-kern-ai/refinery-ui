import { ProjectSize } from "@/src/types/components/projects/projectId/settings/project-export";

export function getMoveRight(tblName: string): boolean {
    //at some point a better grouping would be useful
    switch (tblName) {
        case "embedding tensors":
        case "information sources payloads":
            return true;
        default:
            return false;
    }
}

export function postProcessingFormGroups(projectSize: any): ProjectSize[] {
    const projectExportArray = [];
    projectSize.forEach((element: any) => {
        let hasGdpr = false;
        if (element.table == 'embedding tensors') {
            // hasGdpr = TODO: filter for embeddings
        }
        let group = {
            export: element.default,
            moveRight: getMoveRight(element.table),
            name: element.table,
            desc: hasGdpr ? null : element.description,
            sizeNumber: element.byteSize,
            sizeReadable: element.byteReadable,
        };
        projectExportArray.push(group);
    });
    return projectExportArray;
}