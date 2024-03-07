import { Dispatch, SetStateAction } from "react";

export type GridCardsProps = {
    filteredList: any[];
    setFilteredList: Dispatch<SetStateAction<any[]>>;
    refetch: () => void;
};