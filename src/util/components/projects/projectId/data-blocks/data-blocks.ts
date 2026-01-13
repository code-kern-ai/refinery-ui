import { SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";

export const getSQLTemplatesDict = (projectId: string) => {
    return {
        [SQLTemplates.BLANK_QUERY]: {
            select_query: 'SELECT ',
            from_query: 'FROM public.record r',
            where_query: `WHERE project_id = '${projectId}'`,
            group_by_query: 'GROUP BY ',
            order_by_query: 'ORDER BY ',
        }
    }
}