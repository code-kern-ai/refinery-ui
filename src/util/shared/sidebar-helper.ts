import { VersionOverview } from '@/src/types/shared/sidebar'
import { parseUTC } from '@/submodules/javascript-functions/date-parser'
import { jsonCopy } from '@/submodules/javascript-functions/general'

export default function postprocessVersionOverview(
  versionOverview: VersionOverview[],
): VersionOverview[] {
  const prepareVersionOverview = jsonCopy(versionOverview)
  prepareVersionOverview.forEach((version: any) => {
    version.parseDate = parseUTC(version.lastChecked)
  })
  return prepareVersionOverview.sort((a, b) =>
    a.service.localeCompare(b.service),
  )
}
