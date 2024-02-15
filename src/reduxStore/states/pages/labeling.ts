import {
  getDefaultLabelingSuiteSettings,
  postProcessRla,
  postProcessTokenizedRecords,
} from '@/src/util/components/projects/projectId/labeling/labeling-main-component-helper'
import { postProcessRecordByRecordId } from '@/src/util/components/projects/projectId/settings/attribute-calculation-helper'
import { arrayToDict } from '@/submodules/javascript-functions/general'
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Record } from '@/src/types/components/projects/projectId/settings/attribute-calculation'
import { LabelingSuiteManager } from '@/src/util/classes/labeling/manager'
import { RecordManager } from '@/src/util/classes/labeling/record-manager'
import {
  ComponentType,
  LabelingSuiteSettings,
} from '@/src/types/components/projects/projectId/labeling/settings'
import { UserRole } from '@/src/types/shared/sidebar'

export type CurrentSelection = {
  attributeId: string
  tokenStart: number
  tokenEnd: number
}

type LabelingSuiteState = {
  links: {
    availableLinks: any[]
    selectedLink: any
  }
  recordRequests: {
    token: any[]
    record: Record
    rla: any
  }
  userIconsData: {
    userIcons: any[]
    showUserIcons: boolean
  }
  settings: LabelingSuiteSettings
  tmpHighlightIds: string[]
  displayUserId: string
  displayUserRole: UserRole
  hoverGroupDict: { [key: string]: any }
  activeTokenSelection: CurrentSelection
}

function getInitState(): LabelingSuiteState {
  return {
    links: {
      availableLinks: null,
      selectedLink: null,
    },
    recordRequests: {
      token: [],
      record: null,
      rla: null,
    },
    userIconsData: {
      userIcons: [],
      showUserIcons: false,
    },
    settings: getDefaultLabelingSuiteSettings(),
    tmpHighlightIds: [],
    displayUserId: null,
    displayUserRole: null,
    hoverGroupDict: {},
    activeTokenSelection: null,
  }
}

const initialState = getInitState()

const labelingSlice = createSlice({
  name: 'labeling',
  initialState,
  reducers: {
    setAvailableLinks(state, action) {
      if (action.payload) state.links.availableLinks = action.payload
      else state.links.availableLinks = []
    },
    setSelectedLink(state, action) {
      if (action.payload) state.links.selectedLink = action.payload
      else state.links.selectedLink = []
    },
    updateRecordRequests: {
      reducer(state, action: PayloadAction<any[]>) {
        if (action.payload.length !== 2)
          throw new Error(
            'updateRecordRequests must be called with exactly 2 arguments',
          )
        const [field, data] = action.payload
        if (action.payload) {
          switch (field) {
            case 'token':
              state.recordRequests.token = postProcessTokenizedRecords(data)
              break
            case 'record':
              state.recordRequests.record = postProcessRecordByRecordId(data)
              break
            case 'rla':
              state.recordRequests.rla = data
              if (RecordManager.ignoreRlas(state.recordRequests.rla)) return
              LabelingSuiteManager.somethingLoading = false
              break
          }
        } else {
          state.recordRequests = {
            token: [],
            record: null,
            rla: null,
          }
        }
      },
      prepare(field: string, data: any) {
        return {
          payload: [field, data],
        }
      },
    },
    updateUsers: {
      reducer(state, action: PayloadAction<any[]>) {
        if (action.payload.length !== 2)
          throw new Error('updateUsers must be called with exactly 2 arguments')
        const [field, data] = action.payload
        if (action.payload) state.userIconsData[field] = data
        else
          state.userIconsData = {
            userIcons: [],
            showUserIcons: false,
          }
      },
      prepare(field: string, data: any) {
        return {
          payload: [field, data],
        }
      },
    },
    setSettings(state, action: PayloadAction<any>) {
      if (action.payload) {
        state.settings = action.payload
      } else state.settings = null
    },
    updateSettings: {
      reducer(state, action: PayloadAction<any[]>) {
        if (action.payload.length !== 3)
          throw new Error(
            'updateSettings must be called with exactly 3 arguments',
          )
        let [componentType, settingsPath, value] = action.payload
        let settings
        switch (componentType) {
          case ComponentType.MAIN:
            settings = state.settings.main
            break
          case ComponentType.OVERVIEW_TABLE:
            settings = state.settings.overviewTable
            break
          case ComponentType.LABELING:
            settings = state.settings.labeling
            break
          case ComponentType.TASK_HEADER:
            settings = state.settings.task
            break
        }
        if (!settings) return
        const keyParts = settingsPath.split('.')
        const lastKey = keyParts.pop()
        for (const key of keyParts) {
          if (!settings[key]) return
          settings = settings[key]
        }

        const currentValue = settings[lastKey]
        if (currentValue != value) {
          if (value === undefined) {
            if (typeof currentValue === 'boolean') value = !currentValue
            else throw Error("something isn't right")
          }
          settings[lastKey] = value
        }

        if (componentType == ComponentType.MAIN) {
          const color = state.settings.main.hoverGroupBackgroundColor
          if (color == 'None')
            state.settings.main.hoverGroupBackgroundColorClass = ''
          else if (color == 'light gray')
            state.settings.main.hoverGroupBackgroundColorClass = 'bg-gray-100'
          else if (color == 'gray')
            state.settings.main.hoverGroupBackgroundColorClass = 'bg-gray-200'
          else
            state.settings.main.hoverGroupBackgroundColorClass =
              'bg-' + color + '-200'
        }
      },
      prepare(componentType: ComponentType, settingsPath: string, value?: any) {
        return {
          payload: [componentType, settingsPath, value],
        }
      },
    },
    removeFromRlaById(state, action) {
      const rlaId = action.payload
      if (rlaId) {
        const index = state.recordRequests.rla.findIndex(
          (rla) => rla.id == rlaId,
        )
        if (index != -1) state.recordRequests.rla.splice(index, 1)
      }
    },
    tmpAddHighlightIds(state, action: PayloadAction<string[]>) {
      if (action.payload) {
        state.tmpHighlightIds = action.payload
      } else {
        state.tmpHighlightIds = []
      }
    },
    setUserDisplayId(state, action: PayloadAction<string>) {
      if (action.payload) state.displayUserId = action.payload
      else state.displayUserId = null
    },
    setHoverGroupDict(state, action: PayloadAction<any>) {
      if (action.payload) state.hoverGroupDict = action.payload
      else state.hoverGroupDict = {}
    },
    initOnLabelPageDestruction(state) {
      for (const key in initialState) state[key] = initialState[key]
    },
    setDisplayUserRole(state, action: PayloadAction<UserRole>) {
      if (action.payload) state.displayUserRole = action.payload
      else state.displayUserRole = null
    },
    setActiveTokenSelection(state, action: PayloadAction<CurrentSelection>) {
      if (action.payload) state.activeTokenSelection = action.payload
      else state.activeTokenSelection = null
    },
  },
})

// selectors
export const selectAvailableLinks = (state: any) =>
  state.labeling.links.availableLinks
export const selectAvailableLinksDict = createSelector(
  [selectAvailableLinks],
  (a): any => (a ? arrayToDict(a, 'id') : null),
)
export const selectSelectedLink = (state: any) =>
  state.labeling.links.selectedLink
export const selectRecordRequests = (state: any) =>
  state.labeling.recordRequests
export const selectRecordRequestsToken = (state: any) =>
  state.labeling.recordRequests.token
export const selectRecordRequestsRecord = (state: any) =>
  state.labeling.recordRequests.record
export const selectRecordRequestsRla = (state: any) =>
  state.labeling.recordRequests.rla
export const selectUserIconsData = (state: any) => state.labeling.userIconsData
export const selectSettings = (state: any) => state.labeling.settings
export const selectTmpHighlightIds = (state: any) =>
  state.labeling.tmpHighlightIds
export const selectUserDisplayId = (state: any) => state.labeling.displayUserId
export const selectHoverGroupDict = (state: any) =>
  state.labeling.hoverGroupDict
export const selectDisplayUserRole = (state: any) =>
  state.labeling.displayUserRole
export const selectActiveTokenSelection = (state: any) =>
  state.labeling.activeTokenSelection

export const {
  setAvailableLinks,
  setSelectedLink,
  updateRecordRequests,
  updateUsers,
  setSettings,
  updateSettings,
  removeFromRlaById,
  tmpAddHighlightIds,
  setUserDisplayId,
  setHoverGroupDict,
  initOnLabelPageDestruction,
  setDisplayUserRole,
  setActiveTokenSelection,
} = labelingSlice.actions

export const labelingReducer = labelingSlice.reducer
