import { ExportEnums, GroupDisplayProps } from '@/src/types/shared/export'
import {
  NONE_IN_PROJECT,
  isEnumRadioGroup,
} from '@/src/util/shared/export-helper'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { Tooltip } from '@nextui-org/react'

export default function GroupDisplay(props: GroupDisplayProps) {
  function flipControlValue(
    control: any,
    type: ExportEnums,
    isCheckBox: boolean,
  ) {
    const formControlCopy = jsonCopy(props.formGroup)
    const activeStateCtrl = control['active']
    if (isCheckBox || !activeStateCtrl) {
      control['active'] = !activeStateCtrl
    }
    if (isEnumRadioGroup(type)) {
      const parent = formControlCopy[props.type]
      for (const key in parent) {
        if (key == control['value']) parent[key]['active'] = true
        else parent[key]['active'] = false
      }
    }
    if (type == ExportEnums.ExportPreset) {
      props.setPresetValues(control['value'], formControlCopy)
      return
    }
    if (control['value']) {
      formControlCopy[props.type][control['value']] = control
    } else {
      formControlCopy[props.type][control['name']] = control
    }
    formControlCopy[props.type][control['name']] = control
    props.updateFormGroup(formControlCopy, control['value'])
  }

  return (
    <>
      {props.formGroup && props.formGroup[props.type] && (
        <div
          className={`contents text-left ${props.hiddenCheckCtrl != null ? (!props.hiddenCheckCtrl ? 'hidden' : null) : null}`}
        >
          {props.heading && (
            <label className="col-span-full col-start-1 text-base font-medium text-gray-900">
              {props.heading}
            </label>
          )}
          {props.subText && (
            <p className="col-span-full col-start-1 -mt-3 text-sm leading-5 text-gray-500">
              {props.subText}
            </p>
          )}
          {props.enumArrays &&
            props.enumArrays.get(props.type).map((v, index) => (
              <div key={index} className="contents">
                {(v.value ? v.value : v.name) && (
                  <>
                    {props.formGroup[props.type][
                      v.value ? v.value : v.name
                    ] && (
                      <div
                        className={`flex items-center ${props.formGroup[props.type][v.value ? v.value : v.name].disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${props.formGroup[props.type][v.value ? v.value : v.name].disabled && !v.tooltip ? 'opacity-50' : ''}`}
                        onClick={() =>
                          props.formGroup[props.type][
                            v.value ? v.value : v.name
                          ].disabled
                            ? null
                            : flipControlValue(
                                props.formGroup[props.type][
                                  v.value ? v.value : v.name
                                ],
                                props.type,
                                props.isCheckbox,
                              )
                        }
                      >
                        {(v.value ? v.value : v.name) != NONE_IN_PROJECT && (
                          <input
                            checked={
                              props.formGroup[props.type][
                                v.value ? v.value : v.name
                              ].active
                            }
                            type={props.isCheckbox ? 'checkbox' : 'radio'}
                            onChange={() =>
                              flipControlValue(
                                props.formGroup[props.type][
                                  v.value ? v.value : v.name
                                ],
                                props.type,
                                props.isCheckbox,
                              )
                            }
                            className={`pointer-events-none mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500`}
                          />
                        )}
                        {v.tooltip ? (
                          <Tooltip
                            content={v.tooltip}
                            color="invert"
                            placement={index % 3 == 0 ? 'right' : 'left'}
                          >
                            <span
                              className={`label-text mb-0 ${props.formGroup[props.type][v.value ? v.value : v.name].disabled ? 'cursor-not-allowed opacity-50' : 'cursor-help'}`}
                            >
                              <span className="filtersUnderline underline">
                                {v.name}
                              </span>
                            </span>
                          </Tooltip>
                        ) : (
                          <label className="pointer-events-none block select-none text-sm font-medium text-gray-700">
                            {v.name}
                          </label>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  )
}
