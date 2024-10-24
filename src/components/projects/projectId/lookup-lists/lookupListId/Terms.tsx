import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteTermPost, blacklistTermPost, addTermToKnowledgeBasePost, updateTerm } from "@/src/services/base/lookup-lists";
import { Term, TermsProps } from "@/src/types/components/projects/projectId/lookup-lists";
import { BLACKLISTED_TERMS_DROPDOWN_OPTIONS, TERMS_DROPDOWN_OPTIONS, isTermUnique } from "@/src/util/components/projects/projectId/lookup-lists-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Tooltip } from "@nextui-org/react";
import { IconCircleCheckFilled, IconCircleMinus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { useSelector } from "react-redux";

export default function Terms(props: TermsProps) {
    const router = useRouter();
    const terms = props.terms;
    const projectId = useSelector(selectProjectId);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [termEditorOpen, setTermEditorOpen] = useState(false);
    const [editableTerm, setEditableTerm] = useState('');
    const [newTermName, setNewTermName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    function addTermToKnowledgeBaseImpl() {
        if (name == '' || !isTermUnique(name, terms)) return;
        addTermToKnowledgeBasePost(projectId, { value: name, comment: description, knowledgeBaseId: router.query.lookupListId }, (res) => {
            setName("");
            setDescription("");
            props.refetchTerms();
        });
    }

    function executeOption(option: string, term: Term) {
        switch (option) {
            case "Edit term":
                openTermEditor(true, term.id, term.value, term.comment ?? '');
                setNewTermName(term.value);
                setNewDescription(term.comment ?? '');
                break;
            case "Remove term":
                removeTerm(term);
                break;
            case "Blacklist term":
            case "Whitelist term":
                blacklistTerm(term);
                break;
        }
    }

    function removeTerm(term: Term) {
        deleteTermPost(projectId, term.id, (res) => {
            props.refetchTerms();
        });
    }

    function blacklistTerm(term: Term) {
        blacklistTermPost(projectId, term.id, (res) => {
            props.refetchTerms();
        });
    }

    function openTermEditor(open: boolean, termId: string, value: string, comment: string) {
        setTermEditorOpen(open);
        if (open) {
            setEditableTerm(termId);
        } else {
            updateTerm(projectId, { termId: termId, value: value, comment: comment ?? '' }, (res) => {
                props.refetchTerms();
            });
        }
    }

    function cancelTermEditor() {
        setTermEditorOpen(false);
        setEditableTerm('');
    }

    function updateProperty(property: string, value: string, index: number) {
        const termCopy = jsonCopy(terms);
        termCopy[index][property] = value;
        props.setTerms(termCopy);
    }

    return (<>
        <div className="bg-white flex-1 min-w-0 mb-2 mt-8 flex items-center">
            <span className="text-gray-900 text-lg leading-6 font-medium mr-2">Terms</span>
            {terms.length > 100 && <span className="text-sm leading-5 font-medium text-gray-500">Only 100 of {props.finalSize} entries are displayed</span>}
            <div className="float-right flex gap-2 ml-auto">
                <input value={name} type="text" onInput={(e: any) => setName(e.target.value)} onKeyUp={(e: any) => isTermUnique(e.target.value, terms)}
                    onKeyDown={(e: any) => {
                        if (e.key == "Enter") {
                            addTermToKnowledgeBaseImpl();
                        }
                    }} className="h-8 w-96 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Term" />
                <input value={description} type="text" onInput={(e: any) => setDescription(e.target.value)} onKeyUp={(e: any) => isTermUnique(e.target.value, terms)}
                    onKeyDown={(e: any) => {
                        if (e.key == "Enter") {
                            addTermToKnowledgeBaseImpl();
                        }
                    }} className="h-8 w-96 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Description - optional" />
                <button disabled={name == '' || !isTermUnique(name, terms)} onClick={addTermToKnowledgeBaseImpl}
                    className="bg-indigo-700 flex-shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Add term</button>
            </div>
        </div>
        {terms.length > 0 && <div className="grid grid-cols-1 gap-6 mt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {terms.map((term: Term, index: number) => (<Fragment key={term.id}>
                {!termEditorOpen ? <>
                    {!term.blacklisted && <div className="flex items-center">
                        <div className="w-full relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm items-center text-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <div className="flex items-center">
                                <div className="text-gray-900 font-medium float-left w-full">{term.value}</div>
                                <KernDropdown dropdownClasses="flex justify-end" options={TERMS_DROPDOWN_OPTIONS} hasButtonDots={true}
                                    iconsArray={['IconEdit', 'IconTrash', 'IconShieldFilled']}
                                    selectedOption={(option) => executeOption(option, term)} />
                            </div>

                            <div className="text-gray-500 font-normal italic">{term.comment}</div>
                        </div>
                    </div>}
                </> : (<>
                    {editableTerm == term.id ? <>
                        {!term.blacklisted && <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm items-center text-sm">
                            <div><input type="text" value={newTermName} onChange={(e: any) => setNewTermName(e.target.value)}
                                className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" /></div>
                            <div className="mt-2">
                                <input type="text" value={newDescription} onChange={(e: any) => setNewDescription(e.target.value)}
                                    placeholder="Description - optional"
                                    className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                            </div>
                            <div className="mt-2 flex">
                                <Tooltip content={TOOLTIPS_DICT.GENERAL.SUBMIT} placement="top" color="invert">
                                    <button className="mx-2" onClick={() => {
                                        updateProperty('value', newTermName, index);
                                        updateProperty('comment', newDescription, index);
                                        openTermEditor(false, term.id, newTermName, newDescription);
                                    }}>
                                        <IconCircleCheckFilled />
                                    </button>
                                </Tooltip>
                                <Tooltip content={TOOLTIPS_DICT.GENERAL.CANCEL} placement="top" color="invert">
                                    <button onClick={cancelTermEditor}>
                                        <IconCircleMinus />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>}
                    </> : <>
                        {!term.blacklisted && <div className="flex items-center">
                            <div className="w-full relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm items-center text-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <div className="flex items-center">
                                    <div className="text-gray-900 font-medium float-left">{term.value}</div>
                                    <KernDropdown dropdownClasses="flex justify-end" options={TERMS_DROPDOWN_OPTIONS} hasButtonDots={true}
                                        iconsArray={['IconEdit', 'IconTrash', 'IconShieldFilled']}
                                        selectedOption={(option) => executeOption(option, term)} />
                                </div>

                                <div className="text-gray-500 font-normal italic">{term.comment}</div>
                            </div>
                        </div>}
                    </>}
                </>)}
            </Fragment>))}
        </div>}
        <div className="mt-8">
            <span className="text-gray-900 text-lg leading-6 font-medium mr-4">Blacklisted terms</span>
            <span className="text-sm leading-5 font-medium text-gray-500">Not part of the lookup list in a function and
                won&apos;t
                be added any longer on text selection</span>
            {terms.length > 0 && <div className="grid grid-cols-1 gap-6 mt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {terms.map((term: Term, index: number) => (<Fragment key={term.id}>
                    {term.blacklisted && <div className="flex items-center">
                        <div className="w-full relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm items-center text-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <div className="flex items-center">
                                <div className="text-gray-900 font-medium float-left w-full">{term.value}</div>
                                <KernDropdown dropdownClasses="flex justify-end" options={BLACKLISTED_TERMS_DROPDOWN_OPTIONS} hasButtonDots={true}
                                    iconsArray={['IconTrash', 'IconShieldCheckFilled']}
                                    selectedOption={(option) => executeOption(option, term)} />
                            </div>

                            <div className="text-gray-500 font-normal italic">{term.comment}</div>
                        </div>
                    </div>}
                </Fragment>))}
            </div>}
        </div>

    </>)
}