import { Embedding, PlatformType } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ProjectSize } from "@/src/types/components/projects/projectId/settings/project-export";

export enum ProjectExportGroup {
    EMBEDDING_TENSORS = 'embedding tensors',
    INFORMATION_SOURCES_PAYLOADS = 'information sources payloads',
}

export function getMoveRight(tblName: string): boolean {
    //at some point a better grouping would be useful
    switch (tblName) {
        case ProjectExportGroup.EMBEDDING_TENSORS:
        case ProjectExportGroup.INFORMATION_SOURCES_PAYLOADS:
            return true;
        default:
            return false;
    }
}

export function postProcessingFormGroups(projectSize: any, embeddings: Embedding[]): ProjectSize[] {
    const projectExportArray = [];
    projectSize.forEach((element: any) => {
        let hasGdpr = false;
        if (element.table == ProjectExportGroup.EMBEDDING_TENSORS) {
            hasGdpr = embeddings.some((e: any) => e.name.split("-")[2] == PlatformType.COHERE || e.name.split("-")[2] == PlatformType.OPEN_AI || e.name.split("-")[2] == PlatformType.AZURE);
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