import { SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";

export const getSQLTemplatesDict = (projectId: string) => {
    return {
        [SQLTemplates.BLANK_QUERY]: {
            select_clause: 'SELECT ',
            from_clause: 'FROM public.record r',
            where_clause: `WHERE project_id = '${projectId}'`,
            group_by_clause: 'GROUP BY ',
            order_by_clause: 'ORDER BY ',
        }
    }
}