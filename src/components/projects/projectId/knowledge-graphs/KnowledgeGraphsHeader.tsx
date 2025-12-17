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
import { selectKnowledgeGraphsAll, setKnowledgeGraphType } from '@/src/reduxStore/states/pages/knowledge-graphs';

const KNOWLEDGE_GRAPHS_TYPES = Object.values(KnowledgeGraphType);
const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];

export default function KnowledgeGraphsHeader(props: KnowledgeGraphsHeaderProps) {
    const dispatch = useDispatch();

    const knowledgeGraphs = useSelector(selectKnowledgeGraphsAll);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_KNOWLEDGE_GRAPH));

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
        knowledgeGraphs.forEach((knowledgeGraph, index) => {
            knowledgeGraphs[index].selected = checked;
        });
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
        <div className="flex-shrink-0 flex justify-end items-center">
            <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center mt-2 xl:mt-0 justify-end">
                <KernDropdown options={KNOWLEDGE_GRAPHS_TYPES} buttonName="New knowledge graph"
                    selectedOption={(option: string) => executeOption(option)} buttonClasses={`${style.actionsHeight} text-xs whitespace-nowrap`} dropdownClasses="mr-3" dropdownItemsWidth='w-48' dropdownWidth='w-48'
                    iconsArray={['IconCode', 'IconBolt']} useFillForIcons={[false, true]} />

                {knowledgeGraphs && knowledgeGraphs.length > 0 ? (
                    <KernDropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, knowledgeGraphs.every((checked) => !checked.selected)]}
                        selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                        iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']} />
                ) : (
                    <KernButton
                        className="mr-3"
                        disabled={true}
                        text="Actions"
                        tooltipPlacement="top"
                        icon={ChevronDownIcon}
                    />
                )}
            </div>

            <DeleteKnowledgeGraphModal selectionList={selectionList} countSelected={countSelected} refetch={props.refetch} />
        </div >
    )
}