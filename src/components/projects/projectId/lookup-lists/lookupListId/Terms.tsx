import { selectProjectId } from '@/src/reduxStore/states/project'
import {
  ADD_TERM_TO_LOOKUP_LIST,
  BLACKLIST_TERM,
  REMOVE_TERM,
  UPDATE_TERM,
} from '@/src/services/gql/mutations/lookup-lists'
import {
  Term,
  TermsProps,
} from '@/src/types/components/projects/projectId/lookup-lists'
import {
  BLACKLISTED_TERMS_DROPDOWN_OPTIONS,
  TERMS_DROPDOWN_OPTIONS,
  isTermUnique,
} from '@/src/util/components/projects/projectId/lookup-lists-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconCircleCheckFilled, IconCircleMinus } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'
import { useSelector } from 'react-redux'

export default function Terms(props: TermsProps) {
  const router = useRouter()
  const terms = props.terms
  const projectId = useSelector(selectProjectId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [termEditorOpen, setTermEditorOpen] = useState(false)
  const [editableTerm, setEditableTerm] = useState('')
  const [newTermName, setNewTermName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const [addTermsMut] = useMutation(ADD_TERM_TO_LOOKUP_LIST)
  const [removeTermMut] = useMutation(REMOVE_TERM)
  const [blacklistTermMut] = useMutation(BLACKLIST_TERM)
  const [updateTermMut] = useMutation(UPDATE_TERM)

  function addTermToKnowledgeBase() {
    if (name == '' || !isTermUnique(name, terms)) return
    addTermsMut({
      variables: {
        projectId: projectId,
        value: name,
        comment: description,
        knowledgeBaseId: router.query.lookupListId,
      },
    }).then((res) => {
      setName('')
      setDescription('')
      props.refetchTerms()
    })
  }

  function executeOption(option: string, term: Term) {
    switch (option) {
      case 'Edit term':
        openTermEditor(true, term.id, term.value, term.comment ?? '')
        setNewTermName(term.value)
        setNewDescription(term.comment ?? '')
        break
      case 'Remove term':
        removeTerm(term)
        break
      case 'Blacklist term':
      case 'Whitelist term':
        blacklistTerm(term)
        break
    }
  }

  function removeTerm(term: Term) {
    removeTermMut({
      variables: { projectId: projectId, termId: term.id },
    }).then((res) => {
      props.refetchTerms()
    })
  }

  function blacklistTerm(term: Term) {
    blacklistTermMut({
      variables: { projectId: projectId, termId: term.id },
    }).then((res) => {
      props.refetchTerms()
    })
  }

  function openTermEditor(
    open: boolean,
    termId: string,
    value: string,
    comment: string,
  ) {
    setTermEditorOpen(open)
    if (open) {
      setEditableTerm(termId)
    } else {
      updateTermMut({
        variables: {
          projectId: projectId,
          termId: termId,
          value: value,
          comment: comment ?? '',
        },
      }).then((res) => {
        props.refetchTerms()
      })
    }
  }

  function cancelTermEditor() {
    setTermEditorOpen(false)
    setEditableTerm('')
  }

  function updateProperty(property: string, value: string, index: number) {
    const termCopy = jsonCopy(terms)
    termCopy[index][property] = value
    props.setTerms(termCopy)
  }

  return (
    <>
      <div className="mb-2 mt-8 flex min-w-0 flex-1 items-center bg-white">
        <span className="mr-2 text-lg font-medium leading-6 text-gray-900">
          Terms
        </span>
        {terms.length > 100 && (
          <span className="text-sm font-medium leading-5 text-gray-500">
            Only 100 of {props.finalSize} entries are displayed
          </span>
        )}
        <div className="float-right ml-auto flex gap-2">
          <input
            value={name}
            type="text"
            onInput={(e: any) => setName(e.target.value)}
            onKeyUp={(e: any) => isTermUnique(e.target.value, terms)}
            onKeyDown={(e: any) => {
              if (e.key == 'Enter') {
                addTermToKnowledgeBase()
              }
            }}
            className="placeholder-italic h-8 w-96 rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            placeholder="Term"
          />
          <input
            value={description}
            type="text"
            onInput={(e: any) => setDescription(e.target.value)}
            onKeyUp={(e: any) => isTermUnique(e.target.value, terms)}
            onKeyDown={(e: any) => {
              if (e.key == 'Enter') {
                addTermToKnowledgeBase()
              }
            }}
            className="placeholder-italic h-8 w-96 rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            placeholder="Description - optional"
          />
          <button
            disabled={name == '' || !isTermUnique(name, terms)}
            onClick={addTermToKnowledgeBase}
            className="flex-shrink-0 cursor-pointer rounded-md bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add term
          </button>
        </div>
      </div>
      {terms.length > 0 && (
        <div className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {terms.map((term: Term, index: number) => (
            <Fragment key={term.id}>
              {!termEditorOpen ? (
                <>
                  {!term.blacklisted && (
                    <div className="flex items-center">
                      <div className="relative w-full items-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                        <div className="flex items-center">
                          <div className="float-left w-full font-medium text-gray-900">
                            {term.value}
                          </div>
                          <Dropdown2
                            dropdownClasses="flex justify-end"
                            options={TERMS_DROPDOWN_OPTIONS}
                            hasButtonDots={true}
                            iconsArray={[
                              'IconEdit',
                              'IconTrash',
                              'IconShieldFilled',
                            ]}
                            selectedOption={(option) =>
                              executeOption(option, term)
                            }
                          />
                        </div>

                        <div className="font-normal italic text-gray-500">
                          {term.comment}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {editableTerm == term.id ? (
                    <>
                      {!term.blacklisted && (
                        <div className="relative items-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm">
                          <div>
                            <input
                              type="text"
                              value={newTermName}
                              onChange={(e: any) =>
                                setNewTermName(e.target.value)
                              }
                              className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            />
                          </div>
                          <div className="mt-2">
                            <input
                              type="text"
                              value={newDescription}
                              onChange={(e: any) =>
                                setNewDescription(e.target.value)
                              }
                              placeholder="Description - optional"
                              className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            />
                          </div>
                          <div className="mt-2 flex">
                            <Tooltip
                              content={TOOLTIPS_DICT.GENERAL.SUBMIT}
                              placement="top"
                              color="invert"
                            >
                              <button
                                className="mx-2"
                                onClick={() => {
                                  updateProperty('value', newTermName, index)
                                  updateProperty(
                                    'comment',
                                    newDescription,
                                    index,
                                  )
                                  openTermEditor(
                                    false,
                                    term.id,
                                    newTermName,
                                    newDescription,
                                  )
                                }}
                              >
                                <IconCircleCheckFilled />
                              </button>
                            </Tooltip>
                            <Tooltip
                              content={TOOLTIPS_DICT.GENERAL.CANCEL}
                              placement="top"
                              color="invert"
                            >
                              <button onClick={cancelTermEditor}>
                                <IconCircleMinus />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {!term.blacklisted && (
                        <div className="flex items-center">
                          <div className="relative w-full items-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                            <div className="flex items-center">
                              <div className="float-left font-medium text-gray-900">
                                {term.value}
                              </div>
                              <Dropdown2
                                dropdownClasses="flex justify-end"
                                options={TERMS_DROPDOWN_OPTIONS}
                                hasButtonDots={true}
                                iconsArray={[
                                  'IconEdit',
                                  'IconTrash',
                                  'IconShieldFilled',
                                ]}
                                selectedOption={(option) =>
                                  executeOption(option, term)
                                }
                              />
                            </div>

                            <div className="font-normal italic text-gray-500">
                              {term.comment}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Fragment>
          ))}
        </div>
      )}
      <div className="mt-8">
        <span className="mr-4 text-lg font-medium leading-6 text-gray-900">
          Blacklisted terms
        </span>
        <span className="text-sm font-medium leading-5 text-gray-500">
          Not part of the lookup list in a function and won&apos;t be added any
          longer on text selection
        </span>
        {terms.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {terms.map((term: Term, index: number) => (
              <Fragment key={term.id}>
                {term.blacklisted && (
                  <div className="flex items-center">
                    <div className="relative w-full items-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                      <div className="flex items-center">
                        <div className="float-left w-full font-medium text-gray-900">
                          {term.value}
                        </div>
                        <Dropdown2
                          dropdownClasses="flex justify-end"
                          options={BLACKLISTED_TERMS_DROPDOWN_OPTIONS}
                          hasButtonDots={true}
                          iconsArray={['IconTrash', 'IconShieldCheckFilled']}
                          selectedOption={(option) =>
                            executeOption(option, term)
                          }
                        />
                      </div>

                      <div className="font-normal italic text-gray-500">
                        {term.comment}
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
