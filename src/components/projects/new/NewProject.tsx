import { UploadFileType, UploadOptions } from "@/src/types/shared/upload";
import Upload from "../../shared/upload/Upload";
import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_ALL_TOKENIZER_OPTIONS } from "@/src/services/gql/queries/projects";
import { useDispatch, useSelector } from "react-redux";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { ConfigManager } from "@/src/services/base/config";

export default function NewProject() {
    const dispatch = useDispatch();

    const isManaged = useSelector(selectIsManaged);

    const [tokenizerValues, setTokenizerValues] = useState([]);

    const [refetchTokenizerValues] = useLazyQuery(GET_ALL_TOKENIZER_OPTIONS, { fetchPolicy: 'cache-first' });

    const uploadOptions: UploadOptions = {
        deleteProjectOnFail: true,
        tokenizerValues: tokenizerValues,
    }

    useEffect(() => {
        dispatch(setUploadFileType(UploadFileType.RECORDS_NEW));
        refetchTokenizerValues().then((res) => {
            setTokenizerValues(checkWhitelistTokenizer(res.data['languageModels']));
        })
    }, []);

    useEffect(() => {
        uploadOptions.tokenizerValues = tokenizerValues;
    }, [tokenizerValues]);

    function checkWhitelistTokenizer(tokenizer) {
        tokenizer = Array.from(tokenizer);
        const allowedConfigs = ConfigManager.getConfigValue("spacy_downloads");
        for (let i = 0; i < tokenizer.length; i++) {
            tokenizer[i] = { ...tokenizer[i] };
            tokenizer[i].disabled = !allowedConfigs.includes(tokenizer[i].configString);
        }
        tokenizer.sort((a, b) => (+a.disabled) - (+b.disabled) || a.configString.localeCompare(b.configString));

        let firstNotAvailable = true;
        let insertPos = -1;
        for (let i = 0; i < tokenizer.length; i++) {
            const t = tokenizer[i];
            if (t.disabled) {
                if (firstNotAvailable) {
                    insertPos = i;
                    firstNotAvailable = false;
                }
            } else t.disabled = false;
        }

        if (insertPos != -1) {
            tokenizer.splice(insertPos, 0, { disabled: true, name: "------------------------------------------" });
            if (isManaged) {
                tokenizer.splice(insertPos, 0, { disabled: true, name: "if you need the options below feel free to contact us", configString: "email" });
            } else {
                tokenizer.splice(insertPos, 0, { disabled: true, name: "add further options on config page" });
            }
            tokenizer.splice(insertPos, 0, { disabled: true, name: "------------------------------------------" });
        }

        return tokenizer
    }

    return (
        <Upload uploadOptions={uploadOptions} />
    )
}
