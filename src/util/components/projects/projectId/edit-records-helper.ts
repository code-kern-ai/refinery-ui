import { EditRecordComponentData } from '@/src/types/components/projects/projectId/edit-records'
import { isStringTrue } from '@/submodules/javascript-functions/general'

export function createDefaultEditRecordComponentData(): EditRecordComponentData {
  const columnClass = localStorage.getItem('ERcolumnClass') ?? 'grid-cols-3'
  const hideExplainModal = localStorage.getItem('ERhideExplainModal')
  return {
    projectId: null,
    loading: true,
    syncing: false,
    errors: null,
    columnClass: columnClass,
    modals: {
      hideExplainModal: isStringTrue(hideExplainModal),
    },
    navBar: {
      nextDisabled: true,
      prevDisabled: true,
      positionString: null,
    },
    cachedRecordChanges: {},
  }
}

export function buildAccessKey(
  recordId: string,
  attributeName: string,
  subKey?: number,
) {
  if (subKey == undefined) return recordId + '@' + attributeName
  else return recordId + '@' + attributeName + '@' + subKey
}
