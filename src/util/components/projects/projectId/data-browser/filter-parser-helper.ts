export function parseFilterToExtended(): string[] {
    let toReturn = [];
    // toReturn.push(JSON.stringify(buildFilterRecordCategory(true)));
    // if (this.dataBrowser.activeSearchParams.length == 0) {
    //     this.dataBrowser.lastSearchParams = JSON.stringify([]);
    //     return toReturn;
    // }
    // this.dataBrowser.requestedDrillDown = this.dataBrowser.fullSearch.get("DRILL_DOWN").get("DRILL_DOWN").value;
    let first = false;
    let attributeFilter;
    let orderBy = { ORDER_BY: [], ORDER_DIRECTION: [] };
    // for (let searchElement of this.dataBrowser.activeSearchParams) {
    //     if (searchElement.values.group == SearchGroup.ATTRIBUTES) {
    //         attributeFilter = this.buildFilterElementAttribute(first, searchElement);
    //         if (attributeFilter) toReturn.push(JSON.stringify(attributeFilter));
    //     } else if (searchElement.values.group == SearchGroup.LABELING_TASKS) {
    //         this.appendBlackAndWhiteListLabelingTask(toReturn, searchElement);
    //     } else if (searchElement.values.group == SearchGroup.USER_FILTER) {
    //         this.appendBlackAndWhiteListUser(toReturn, searchElement);
    //     } else if (searchElement.values.group == SearchGroup.ORDER_STATEMENTS) {
    //         this.appendActiveOrderBy(searchElement.values, orderBy);
    //     } else if (searchElement.values.group == SearchGroup.COMMENTS) {
    //         this.appendBlackAndWhiteListComments(toReturn, searchElement);
    //     }
    // }
    if (orderBy.ORDER_BY.length > 0) {
        toReturn.push(JSON.stringify(orderBy));
    }


    // this.dataBrowser.lastSearchParams = JSON.stringify(this.dataBrowser.activeSearchParams);
    return toReturn;
}
