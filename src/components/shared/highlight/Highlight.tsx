import { HighlightProps, RegexDisplay } from "@/src/types/shared/highlight";
import { buildRegex, buildRegexps, rebuildText } from "@/src/util/shared/highlight-helper";
import { isStringTrue } from "@/submodules/javascript-functions/general";
import { useEffect, useState } from "react";

export default function Highlight(props: any) {
    const [parts, setParts] = useState<RegexDisplay[]>([]);
    const [finalRegEx, setFinalRegEx] = useState<RegExp[]>([]);

    const [highlightClass, setHighlightClass] = useState('');
    const [addClassString, setAddClassString] = useState('')

    useEffect(() => {
        buildEverything();
        if (!props.highlightClass) {
            setHighlightClass('bg-yellow-300');
        } else {
            setHighlightClass(props.highlightClass);
        }
        if (props.additionalClasses) {
            setAddClassString(props.additionalClasses.join(' '));
        }
    }, [props.highlightClass, props.additionalClasses, props.matchCase, props.regex, props.searchFor, props.searchForExtended, props.text]);

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

    return (<span>
        {parts && parts.map((part, index) => (<span key={index} className={`${part.isMatch ? highlightClass : null} ${addClassString}`}>
            {part.text}
        </span>))}
    </span>)
}