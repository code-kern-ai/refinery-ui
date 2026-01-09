import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { formatBytes } from "@/submodules/javascript-functions/general";
import { NotApplicableBadge } from "@/submodules/react-components/components/Badges";
import { useMemo, useCallback } from "react";

type UseColumnsProps = {
    dateKeys?: string[];
    fileSizeKeys?: string[];
    userKeys?: string[];
    usersDict?: Record<string, any>;
};

export function useColumns({ dateKeys = [], fileSizeKeys = [], userKeys = [], usersDict = {} }: UseColumnsProps = {}) {

    const formatters = useMemo<Record<string, any>>(() => {
        const map: Record<string, any> = {};
        dateKeys.forEach(key => {
            map[key] = value => parseUTC(value);
        });

        fileSizeKeys.forEach(key => {
            map[key] = value => formatBytes(value);
        });

        userKeys.forEach(key => {
            map[key] = value => usersDict[value] ? `${usersDict[value].firstName} ${usersDict[value].lastName}` : <NotApplicableBadge />;
        });
        return map;
    }, [dateKeys, fileSizeKeys, userKeys, usersDict]);

    const renderCell = useCallback((header: string, value: any) => {
        if (value === null || value === undefined) {
            return { type: "text", value };
        }
        const formatter = formatters[header];
        return { type: "text", value: formatter ? formatter(value) : String(value) };
    }, [formatters]);

    return { renderCell };
}
