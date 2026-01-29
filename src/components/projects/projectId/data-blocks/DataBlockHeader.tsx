import { openModal, selectModal } from '@/src/reduxStore/states/modal';
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics.module.css';
import { ModalEnum } from '@/src/types/shared/modal';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import KernDropdown from '@/submodules/react-components/components/KernDropdown';
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconPlus } from '@/submodules/react-components/components/kern-icons/icons';
import { jsonCopy } from '@/submodules/javascript-functions/general';
import { DataBlocksHeaderProps, DataBlockType } from '@/src/types/components/projects/projectId/data-blocks/data-blocks';
import { selectDataBlocksAll, setAllDataBlocks, setDataBlockType } from '@/src/reduxStore/states/pages/data-blocks';
import DeleteDataBlockModal from './DeleteDataBlockModal';
import CreateDataBlockModal from './CreateDataBlockModal';

const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];

export default function DataBlockHeader(props: DataBlocksHeaderProps) {
    const dispatch = useDispatch();

    const dataBlocks = useSelector(selectDataBlocksAll);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_DATA_BLOCK));

    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);

    const prepareSelectionList = useCallback(() => {
        let selectionListFinal = '';
        let countSelected = 0;
        dataBlocks.forEach((dataBlock, index) => {
            if (dataBlock.selected) {
                selectionListFinal += dataBlocks[index].name;
                selectionListFinal += '\n';
                countSelected++;
            }
        });
        setCountSelected(countSelected)
        setSelectionList(selectionListFinal);
    }, [dataBlocks]);

    useEffect(() => {
        prepareSelectionList();
    }, [dataBlocks, prepareSelectionList]);

    useEffect(() => {
        if (!modalDelete) return;
        prepareSelectionList();
    }, [modalDelete, prepareSelectionList]);

    const selectDataBlocks = useCallback((checked: boolean) => {
        const dataBlocksCopy = jsonCopy(dataBlocks);
        dataBlocksCopy.forEach((dataBlock, index) => {
            dataBlocksCopy[index].selected = checked;
        });
        dispatch(setAllDataBlocks(dataBlocksCopy));
    }, [dataBlocks, dispatch]);

    const executeOption = useCallback((option: string) => {
        switch (option) {
            case DataBlockType.LIVE:
                dispatch(setDataBlockType(DataBlockType.LIVE));
                break;
            case DataBlockType.STABLE:
                dispatch(setDataBlockType(DataBlockType.STABLE));
                break;
            case 'Select all':
                selectDataBlocks(true);
                break;
            case 'Deselect all':
                selectDataBlocks(false);
                break;
            case 'Delete selected':
                dispatch(openModal(ModalEnum.DELETE_DATA_BLOCK));
                break;
        }
    }, [dispatch, selectDataBlocks]);

    return (
        <div className="flex-shrink-0 flex justify-end items-center mr-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex-grow">Data Blocks</h3>
            <div className="grid grid-cols-1 gap-x-4 xs:flex flex-row items-center mt-2 xl:mt-0 justify-end">
                <KernButton
                    text="New data block"
                    icon={MemoIconPlus}
                    onClick={() => dispatch(openModal(ModalEnum.CREATE_DATA_BLOCK))}
                />

                {dataBlocks && dataBlocks.length > 0 && (
                    <KernDropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, dataBlocks.every((checked) => !checked.selected)]}
                        selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-sm`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                        iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']} />
                )}
            </div>

            <DeleteDataBlockModal selectionList={selectionList} countSelected={countSelected} refetch={props.refetch} />
            <CreateDataBlockModal />
        </div >
    )
}
