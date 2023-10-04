import Modal from "@/src/components/shared/modal/Modal";
import { selectUseableEmbedableAttributes } from "@/src/reduxStore/states/pages/settings";
import { GET_EMBEDDING_PLATFORMS } from "@/src/services/gql/queries/project";
import { PlatformType } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalEnum } from "@/src/types/shared/modal";
import { GRANULARITY_TYPES_ARRAY, postProcessingEmbeddingPlatforms } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AddNewEmbedding() {
    const useableEmbedableAttributes = useSelector(selectUseableEmbedableAttributes);

    const [targetAttribute, setTargetAttribute] = useState(null);
    const [platform, setPlatform] = useState(null);
    const [granularity, setGranularity] = useState(null);
    const [embeddingPlatforms, setEmbeddingPlatforms] = useState([]);

    const [refetchEmbeddingPlatforms] = useLazyQuery(GET_EMBEDDING_PLATFORMS, { fetchPolicy: 'cache-first' });

    useEffect(() => {
        refetchEmbeddingPlatforms().then((res) => {
            setEmbeddingPlatforms(postProcessingEmbeddingPlatforms(res.data['embeddingPlatforms'].map((platform: any) => platform.platform)));
        });
    }, []);

    function prepareSuggestions() {

    }

    function checkIfAttributeHasToken() {

    }

    function checkForceHiddenHandles() {

    }

    return (
        <Modal modalName={ModalEnum.ADD_EMBEDDING}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Add an embedding </div>
            <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                {useableEmbedableAttributes ? 'Pick from the below solutions to build a vector representation' : 'No usable text attributes to embed exist'}
            </div>
            <form>
                <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <Tooltip content="Choose attribute that will be encoded" placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Target Attribute</span></span>
                    </Tooltip>
                    <Dropdown options={useableEmbedableAttributes} buttonName={targetAttribute ? targetAttribute : 'Choose'} selectedOption={(option: string) => {
                        setTargetAttribute(option);
                        prepareSuggestions();
                        checkIfAttributeHasToken();
                    }} />

                    <Tooltip content="Filter attributes that will be encoded" placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Filter Attributes</span></span>
                    </Tooltip>
                    {/* DROPDOWN WITH CHECKBOXES */}<div></div>

                    <Tooltip content="Choose the platform to embed records" placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Platform</span></span>
                    </Tooltip>
                    <Dropdown options={embeddingPlatforms} buttonName={platform ? platform : 'Choose'} selectedOption={(option: string) => {
                        setPlatform(option);
                        checkForceHiddenHandles();
                    }} />

                    <Tooltip content="One embedding per attribute vs. per token" placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Granularity</span></span>
                    </Tooltip>
                    <Dropdown options={GRANULARITY_TYPES_ARRAY} buttonName={granularity ? granularity : 'Choose'} selectedOption={(option: string) => {
                        setGranularity(option);
                        checkForceHiddenHandles();
                    }} />

                    {platform == PlatformType.HUGGING_FACE && <Suggestions />}

                </div>
            </form>
        </Modal>
    )
}

function Suggestions() {
    return <><Tooltip content="Choose your model" placement="right" color="invert">
        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Model</span></span>
    </Tooltip>
        <div className="dropdown">
            <div tabIndex={0} className="flex flex-row select select-bordered select-sm pl-0 pr-8">
                <input type="text" placeholder="Type to search..." />
                {/* <input #inputEmbeddingHandle type="text" placeholder="Type to search..."
                class="w-full font-bold input input-sm" style="outline:none; box-shadow:none;height:1.9rem;"
                [value]="settingModals.embedding.create.embeddingCreationFormGroup.get('model').value"
                (focus)="$event.target.select()"
                (keydown.enter)="selectFirstUnhiddenEmbeddingHandle(inputEmbeddingHandle)"
                (input)="checkEmbeddingHandles($event.target)"> */}
                <ul tabIndex={0} className="p-2 w-full menu dropdown-content bg-base-100 shadow height-dropdown overflow-y-auto">
                    {/* <li #me *ngFor="let model of suggestions; let k = index"
                [ngClass]="model.hidden || model.forceHidden?'hidden':null"
                (mouseenter)="setCurrentEmbeddingHandle(model,hoverBox,me)"
                (mouseleave)="setCurrentEmbeddingHandle(null,null,null)">

                <label class="cursor-pointer label" [ngClass]="model.isModelDownloaded ? 'text-green-700' : ''"
                    (click)="selectEmbeddingHandle(model,inputEmbeddingHandle,hoverBox)">
                    {{model.configString}}
                </label>
            </li> */}
                </ul>
            </div>
        </div ></>
}