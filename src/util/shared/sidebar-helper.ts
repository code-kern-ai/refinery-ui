import { VersionOverview } from "@/src/types/shared/sidebar";

export default function postprocessVersionOverview(versionOverview: VersionOverview[]): VersionOverview[] {
    return versionOverview.sort((a, b) => a.service.localeCompare(b.service));;
}