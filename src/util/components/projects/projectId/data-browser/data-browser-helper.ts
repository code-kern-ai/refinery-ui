import { DataSlice } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { Project } from "@/src/types/components/projects/projects-list";
import { User } from "@/src/types/shared/general";
import { buildFullLink } from "@/src/util/shared/link-parser-helper";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { sliceTypeToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { Slice } from "@/submodules/javascript-functions/enums/enums";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function postProcessDataSlices(dataSlices: DataSlice[]) {
    const prepareDataSlices = jsonCopy(dataSlices);
    prepareDataSlices.forEach(slice => {
        slice.displayName = slice.sliceType != Slice.STATIC_OUTLIER ? slice.name : parseUTC(slice.createdAt, true);
        slice.color = getColorStruct(slice.sliceType);
    });
    return prepareDataSlices;
}

export function getColorStruct(sliceType: Slice) {
    const color = getColorForSliceType(sliceType)
    return {
        name: color,
        textColor: 'text-' + color + '-700',
        fillColor: 'fill-' + color + '-100',
    }
}

function getColorForSliceType(sliceType: Slice) {
    switch (sliceType) {
        case Slice.STATIC_OUTLIER:
            return 'green';
        case Slice.STATIC_DEFAULT:
            return 'orange';
        case Slice.DYNAMIC_DEFAULT:
            return 'blue';
    }
}

export function updateSliceInfoHelper(slice: DataSlice, project: Project, users: User[]) {
    let sliceInfo = {};
    if (slice.sliceType == Slice.STATIC_OUTLIER) {
        sliceInfo["Name"] = parseUTC(slice.createdAt);
    } else {
        sliceInfo["Name"] = slice.name;
        sliceInfo["Created at"] = parseUTC(slice.createdAt);
    }
    sliceInfo["Created by"] = "Unknown";

    const findById = users.find(user => user.id == slice.createdBy);
    if (findById) { sliceInfo["Created by"] = findById.firstName + " " + findById.lastName };
    sliceInfo["Type"] = sliceTypeToString(slice.sliceType);

    const info = JSON.parse(slice.info);
    for (let key in info) {
        sliceInfo[key] = info[key];
    }
    if (slice.sliceType == Slice.STATIC_DEFAULT) {
        sliceInfo["Link"] = "/projects/" + project.id + "/labeling/" + slice.id;
        sliceInfo["Link"] = buildFullLink("/projects/" + project.id + "/labeling/" + slice.id);
    }
    return sliceInfo;
}