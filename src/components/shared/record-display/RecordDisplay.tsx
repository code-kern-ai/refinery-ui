import {
  selectConfiguration,
  selectIsTextHighlightNeeded,
  selectTextHighlight,
} from '@/src/reduxStore/states/pages/data-browser'
import {
  selectAttributesDict,
  selectVisibleAttributesHeuristics,
} from '@/src/reduxStore/states/pages/settings'
import { LineBreaksType } from '@/src/types/components/projects/projectId/data-browser/data-browser'
import { Attribute } from '@/src/types/components/projects/projectId/settings/data-schema'
import { DataTypeEnum } from '@/src/types/shared/general'
import {
  postProcessAttributes,
  postProcessRecord,
} from '@/src/util/shared/record-display-helper'
import { IconAlertCircle } from '@tabler/icons-react'
import { use, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Highlight from '../highlight/Highlight'

export function RecordDisplay(props: any) {
  const attributesDict = useSelector(selectAttributesDict)
  const configuration = useSelector(selectConfiguration)
  const textHighlight = useSelector(selectTextHighlight)
  const isTextHighlightNeeded = useSelector(selectIsTextHighlightNeeded)

  const [preparedRecord, setPreparedRecord] = useState<any>(null)
  const [preparedAttributes, setPreparedAttributes] =
    useState<Attribute[]>(null)

  useEffect(() => {
    if (!props.record || !props.attributes) return
    if (!isTextHighlightNeeded) return
    setPreparedRecord(postProcessRecord(props.record, props.attributes))
    setPreparedAttributes(postProcessAttributes(props.attributes))
  }, [props.record, props.attributes, isTextHighlightNeeded])

  return (
    <>
      {preparedAttributes &&
        preparedAttributes.map((attribute, index) => (
          <div key={attribute.key}>
            <div className="text-sm font-semibold text-gray-800">
              <div className="flex flex-row items-center">
                <span className="font-dmMono">
                  {attributesDict[attribute.id]?.name}
                </span>
              </div>
            </div>
            {attributesDict[attribute.id] && (
              <div className="overflow-anywhere mb-4 flex text-sm text-gray-800">
                {attribute.dataType == DataTypeEnum.EMBEDDING_LIST ? (
                  <div className="flex flex-col gap-y-1 divide-y">
                    {preparedRecord.data[attributesDict[attribute.key].name] &&
                      preparedRecord.data[
                        attributesDict[attribute.key].name
                      ].map((item, indexJ) => (
                        <div key={indexJ} className="pt-1">
                          {configuration.highlightText &&
                          isTextHighlightNeeded[attribute.key] ? (
                            <Highlight
                              text={item.toString()}
                              additionalClasses={[
                                configuration.lineBreaks ==
                                LineBreaksType.NORMAL
                                  ? ''
                                  : configuration.lineBreaks ==
                                      LineBreaksType.IS_PRE_WRAP
                                    ? 'whitespace-pre-wrap'
                                    : 'whitespace-pre-line',
                              ]}
                              searchForExtended={textHighlight[attribute.id]}
                            />
                          ) : (
                            <span
                              className={
                                configuration &&
                                configuration.lineBreaks !=
                                  LineBreaksType.NORMAL
                                  ? configuration.lineBreaks ==
                                    LineBreaksType.IS_PRE_WRAP
                                    ? 'whitespace-pre-wrap'
                                    : 'whitespace-pre-line'
                                  : ''
                              }
                            >
                              {item != null && item !== '' ? (
                                item
                              ) : (
                                <NotPresentInRecord />
                              )}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <>
                    {configuration.highlightText &&
                    isTextHighlightNeeded[attribute.key] ? (
                      <Highlight
                        text={preparedRecord.data[
                          attributesDict[attribute.key].name
                        ].toString()}
                        additionalClasses={[
                          configuration.lineBreaks == LineBreaksType.NORMAL
                            ? ''
                            : configuration.lineBreaks ==
                                LineBreaksType.IS_PRE_WRAP
                              ? 'whitespace-pre-wrap'
                              : 'whitespace-pre-line',
                        ]}
                        searchForExtended={textHighlight[attribute.key]}
                      />
                    ) : (
                      <span
                        className={
                          configuration &&
                          configuration.lineBreaks != LineBreaksType.NORMAL
                            ? configuration.lineBreaks ==
                              LineBreaksType.IS_PRE_WRAP
                              ? 'whitespace-pre-wrap'
                              : 'whitespace-pre-line'
                            : ''
                        }
                      >
                        {preparedRecord.data[
                          attributesDict[attribute.key].name
                        ] != null &&
                        preparedRecord.data[
                          attributesDict[attribute.key].name
                        ] !== '' ? (
                          preparedRecord.data[
                            attributesDict[attribute.key].name
                          ]
                        ) : (
                          <NotPresentInRecord />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
    </>
  )
}

function NotPresentInRecord() {
  return (
    <div className="flex items-center">
      <IconAlertCircle className="text-yellow-700" />
      <span className="text-sm font-normal italic text-gray-500">
        Not present in the record
      </span>
    </div>
  )
}
