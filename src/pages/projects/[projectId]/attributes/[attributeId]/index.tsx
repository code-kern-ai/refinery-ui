import AttributeCalculation from "@/src/components/projects/projectId/attributes/attributeId/AttributeCalculations";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AttributeCalculationPage() {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.ATTRIBUTE_CALCULATION));
        dispatch(setDisplayIconComments(true));
    }, [])

    return (
        <AttributeCalculation />
    )
}