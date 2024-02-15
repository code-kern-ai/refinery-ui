import { ModelsDownloaded } from '@/src/types/components/models-downloaded/models-downloaded'
import { parseUTC } from '@/submodules/javascript-functions/date-parser'
import { formatBytes } from '@/submodules/javascript-functions/general'

export function postProcessingModelsDownload(
  modelsDownloaded: ModelsDownloaded[],
): ModelsDownloaded[] {
  return modelsDownloaded.map((model: ModelsDownloaded) => {
    return {
      ...model,
      sizeFormatted: formatBytes(model.size),
      parseDate: parseUTC(model.date),
    }
  })
}

export function postProcessingZeroShotEncoders(
  zeroShotModels: ModelsDownloaded[],
  encoders: ModelsDownloaded[],
): any {
  const prepareModelsList = encoders.filter(
    (el: any) =>
      el.configString != 'bag-of-characters' &&
      el.configString != 'bag-of-words' &&
      el.configString != 'tf-idf',
  )
  zeroShotModels.sort((a, b) => a.prio - b.prio)
  return prepareModelsList.concat(zeroShotModels)
}
