import { HighlightProps, RegexDisplay } from "@/src/types/shared/highlight";
import { buildRegex, buildRegexps, rebuildText } from "@/src/util/shared/highlight-helper";
import { isStringTrue } from "@/submodules/javascript-functions/general";
import { useEffect, useState } from "react";

export default function Highlight(props: HighlightProps) {
    const [parts, setParts] = useState<RegexDisplay[]>([]);
    const [finalRegEx, setFinalRegEx] = useState<RegExp[]>([]);

    useEffect(() => {
        buildEverything();
    }, []);

    function buildEverything() {
        let matchCase = props.matchCase;
        const finalRegex: RegExp[] = [];
        if (typeof matchCase == 'string') {
            matchCase = isStringTrue(matchCase);
        }
        if (props.regex) Array.isArray(props.regex) ? finalRegex.push(...props.regex) : finalRegex.push(props.regex);
        if (props.searchFor) finalRegex.push(...buildRegexps(props.searchFor, props.matchCase));
        if (props.searchForExtended) {
            for (const search of props.searchForExtended) {
                if (search.regex) finalRegex.push(search.regex);
                else if (search.searchFor) finalRegex.push(buildRegex(search.searchFor, search.matchCase));
            }
        }
        setFinalRegEx(finalRegex);
        setParts(rebuildText(props.text, finalRegEx));
    }

    return (<></>)
}