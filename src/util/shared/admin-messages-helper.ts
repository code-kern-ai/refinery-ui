import { AdminMessage, AdminMessageLevel } from "@/src/types/shared/admin-messages";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export const adminMessageLevels = {
    [AdminMessageLevel.INFO]: { label: 'Info', color: 'blue' },
    [AdminMessageLevel.WARNING]: { label: 'Warning', color: 'yellow' }
};

export function postProcessAdminMessages(adminMessages: AdminMessage[]): AdminMessage[] {
    return adminMessages.map((message) => {
        message = { ...message };
        message.displayDate = parseUTC(message.archiveDate);
        const color = adminMessageLevels[message.level].color;
        message.textColor = 'text-' + color + '-700';
        message.backgroundColor = 'bg-' + color + '-100';
        message.borderColor = 'border-' + color + '-400';
        message.visible = true;
        return message;
    });;
}