import { openModal, selectModal } from '@/src/reduxStore/states/modal';
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics.module.css';
import { ModalEnum } from '@/src/types/shared/modal';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { Tooltip } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import KernDropdown from '@/submodules/react-components/components/KernDropdown';
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import DeleteKnowledgeGraphModal from './DeleteKnowledgeGraphModal';
import { KnowledgeGraphsHeaderProps, KnowledgeGraphType } from '@/src/types/components/projects/projectId/knowledge-graphs/knowledge-graphs';
import { selectKnowledgeGraphsAll, setAllKnowledgeGraphs, setKnowledgeGraphType } from '@/src/reduxStore/states/pages/knowledge-graphs';
import { MemoIconPlus } from '@/submodules/react-components/components/kern-icons/icons';
import CreateKnowledgeGraphModal from './CreateKnowledgeGraphModal';
import { jsonCopy } from '@/submodules/javascript-functions/general';

const KNOWLEDGE_GRAPHS_TYPES = Object.values(KnowledgeGraphType);
const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];

export default function KnowledgeGraphsHeader(props: KnowledgeGraphsHeaderProps) {
    const dispatch = useDispatch();

    const knowledgeGraphs = useSelector(selectKnowledgeGraphsAll);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_KNOWLEDGE_GRAPH));
    const modalCreate = useSelector(selectModal(ModalEnum.CREATE_KNOWLEDGE_GRAPH));

    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);

    useEffect(() => {
        if (!modalDelete) return;
        prepareSelectionList();
    }, [modalDelete]);

    const executeOption = useCallback((option: string) => {
        switch (option) {
            case KnowledgeGraphType.LIVE:
                dispatch(setKnowledgeGraphType(KnowledgeGraphType.LIVE));
                break;
            case KnowledgeGraphType.STABLE:
                dispatch(setKnowledgeGraphType(KnowledgeGraphType.STABLE));
                break;
            case 'Select all':
                selectKnowledgeGraphs(true);
                break;
            case 'Deselect all':
                selectKnowledgeGraphs(false);
                break;
            case 'Delete selected':
                prepareSelectionList();
                dispatch(openModal(ModalEnum.DELETE_KNOWLEDGE_GRAPH));
                break;
        }
    }, []);

    const selectKnowledgeGraphs = useCallback((checked: boolean) => {
        const knowledgeGraphsCopy = jsonCopy(knowledgeGraphs);
        knowledgeGraphsCopy.forEach((knowledgeGraph, index) => {
            knowledgeGraphsCopy[index].selected = checked;
        });
        dispatch(setAllKnowledgeGraphs(knowledgeGraphsCopy));
        prepareSelectionList();
    }, [knowledgeGraphs]);

    const prepareSelectionList = useCallback(() => {
        let selectionListFinal = '';
        let countSelected = 0;
        knowledgeGraphs.forEach((knowledgeGraph, index) => {
            if (knowledgeGraph.selected) {
                selectionListFinal += knowledgeGraphs[index].name;
                selectionListFinal += '\n';
                countSelected++;
            }
        });
        setCountSelected(countSelected)
        setSelectionList(selectionListFinal);
    }, [knowledgeGraphs]);

    return (
        <div className="flex-shrink-0 flex justify-end items-center mr-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex-grow">Knowledge Graphs</h3>
            <div className="grid grid-cols-1 gap-x-4 xs:flex flex-row items-center mt-2 xl:mt-0 justify-end">
                <KernButton
                    text="New knowledge graph"
                    icon={MemoIconPlus}
                    onClick={() => dispatch(openModal(ModalEnum.CREATE_KNOWLEDGE_GRAPH))}
                />

                {knowledgeGraphs && knowledgeGraphs.length > 0 && (
                    <KernDropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, knowledgeGraphs.every((checked) => !checked.selected)]}
                        selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-sm`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                        iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']} />
                )}
            </div>

            <DeleteKnowledgeGraphModal selectionList={selectionList} countSelected={countSelected} refetch={props.refetch} />
            <CreateKnowledgeGraphModal />
        </div >
    )
}