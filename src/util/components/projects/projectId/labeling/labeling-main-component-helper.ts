import { LineBreaksType } from '@/src/types/components/projects/projectId/data-browser/data-browser'
import { LabelingLinkType } from '@/src/types/components/projects/projectId/labeling/labeling-main-component'
import {
  LabelingSuiteSettings,
  LabelingSuiteTaskHeaderLabelSettings,
} from '@/src/types/components/projects/projectId/labeling/settings'
import { User } from '@/src/types/shared/general'
import { UserRole } from '@/src/types/shared/sidebar'
import { SessionManager } from '@/src/util/classes/labeling/session-manager'
import { LabelSource } from '@/submodules/javascript-functions/enums/enums'
import {
  countOccurrences,
  jsonCopy,
} from '@/submodules/javascript-functions/general'

export const ONE_DAY = 86400000 // 24 * 60 * 60 * 1000;
export const DUMMY_HUDDLE_ID = '00000000-0000-0000-0000-000000000000'
export const GOLD_STAR_USER_ID = 'GOLD_STAR'
export const ALL_USERS_USER_ID = 'ALL_USERS'

export function parseLabelingLink(router: any) {
  const projectId = router.query.projectId
  const id = router.query.sessionId
  const requestedPosStr = router.query.pos
  const isPosNumber = !Number.isNaN(Number(requestedPosStr))
  const type = linkTypeFromStr(router.query.type)

  return {
    projectId: projectId,
    huddleId: id,
    requestedPos: isPosNumber ? Number(requestedPosStr) : 0,
    linkType: type,
  }
}

function linkTypeFromStr(str: string): LabelingLinkType {
  if (!str) return LabelingLinkType.SESSION
  switch (str.toUpperCase()) {
    case 'DATA_SLICE':
      return LabelingLinkType.DATA_SLICE
    case 'HEURISTIC':
      return LabelingLinkType.HEURISTIC
    case 'SESSION':
    default:
      return LabelingLinkType.SESSION
  }
}

export function guessLinkType(userRole: string): string {
  switch (userRole) {
    case UserRole.EXPERT:
      return LabelingLinkType.DATA_SLICE
    case UserRole.ANNOTATOR:
      return LabelingLinkType.HEURISTIC
    case UserRole.ENGINEER:
    default:
      return LabelingLinkType.SESSION
  }
}

export function postProcessTokenizedRecords(data: any) {
  if (!data) return null
  return addDiffToNext({
    recordId: data.recordId,
    attributes: data.attributes.map((attribute) => {
      return {
        raw: attribute.raw,
        attributeId: attribute.attribute.id,
        attributeName: attribute.attribute.name,
        token: !attribute.tokens
          ? null
          : attribute.tokens.map(tokenMapper, attribute.tokens.length - 1),
      }
    }),
  })
}

function addDiffToNext(tokenObj) {
  for (let a of tokenObj.attributes) {
    if (a.token) {
      for (let i = 0; i < a.token.length - 1; i++) {
        a.token[i].nextCloser = a.token[i].posEnd == a.token[i + 1].posStart
      }
    }
  }

  return tokenObj
}

function tokenMapper(token: any, lastIdx: number) {
  let countLineBreaks = countOccurrences(token.value, '\n')
  if (countLineBreaks > 0) {
    // If we are on the first or last token and either/both of them is new lines, the class w-full cannot work because we don't have a previous or next token, that's why we need the original countLineBreaks
    // If we are not on the first or last token, the array of the countLineBreaks has to be one less than the actual countLineBreaks because we use the class w-full of the current line as one line break
    // Adding a completely new line and having a text that needs a new line are different in terms of css classes
    const checkIfOrLastIdx = token.idx == 0 || token.idx == lastIdx
    countLineBreaks = checkIfOrLastIdx ? countLineBreaks : countLineBreaks - 1
  }
  return {
    value: token.value,
    idx: token.idx,
    posStart: token.posStart,
    posEnd: token.posEnd,
    type: token.type,
    countLineBreaks: countLineBreaks,
    countLineBreaksArray:
      countLineBreaks != 0 ? Array(countLineBreaks - 1) : null, // we need an array if we have a countLineBreaks so we can loop through it in the template and create the new lines
  }
}

export function postProcessRla(rlas: any) {
  if (!rlas) return null
  return rlas['edges'].map((edge) => edge['node'])
}

export function getDefaultLabelingSuiteSettings(): LabelingSuiteSettings {
  return {
    main: {
      autoNextRecord: false,
      hoverGroupBackgroundColor: 'green',
      hoverGroupBackgroundColorClass: 'bg-green-200',
      lineBreaks: LineBreaksType.NORMAL,
    },
    overviewTable: {
      show: true,
      showHeuristics: true,
      includeLabelDisplaySettings: true,
    },
    task: {
      show: true,
      isCollapsed: false,
      alwaysShowQuickButtons: true,
    },
    labeling: {
      showNLabelButton: 5,
      showTaskNames: true,
      showHeuristicConfidence: false,
      compactClassificationLabelDisplay: true,
      swimLaneExtractionDisplay: false,
      closeLabelBoxAfterLabel: true,
    },
  }
}

export function getDefaultTaskOverviewLabelSettings(): LabelingSuiteTaskHeaderLabelSettings {
  return {
    showManual: true,
    showWeakSupervision: true,
    showModel: false,
    showHeuristics: false,
  }
}

export function prepareRLADataForRole(
  rlaData: any[],
  user: User,
  displayUserId: string,
  userDisplayRole: UserRole,
): any[] {
  if (user.role != UserRole.ANNOTATOR && userDisplayRole != UserRole.ANNOTATOR)
    return rlaData
  const currentSourceId = SessionManager.getSourceId()
  const allowedTask = SessionManager.getAllowedTask()
  const rlaDataCopy = jsonCopy(rlaData)
  rlaDataCopy.forEach((rla) => {
    if (rla.sourceId && rla.sourceId == currentSourceId) {
      rla.sourceType = LabelSource.MANUAL
      rla.sourceId = null
    } else if (
      rla.createdBy == displayUserId &&
      rla.labelingTaskLabel.labelingTask.id == allowedTask &&
      rla.sourceType == LabelSource.MANUAL
    ) {
      // nothing to change (no deletion flag or modify of existing types)
    } else {
      rla.id = 'x'
    }
  })
  return rlaDataCopy.filter((rla) => rla.id != 'x')
}
