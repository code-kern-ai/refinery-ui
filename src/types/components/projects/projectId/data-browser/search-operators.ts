export enum SearchOperator {
    EQUAL = 'EQUAL',
    BEGINS_WITH = 'BEGINS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    CONTAINS = 'CONTAINS',
    IN = 'IN',
    IN_WC = 'IN_WC',
    BETWEEN = 'BETWEEN',
    GREATER = 'GREATER',
    GREATER_EQUAL = 'GREATER_EQUAL',
    LESS = 'LESS',
    LESS_EQUAL = 'LESS_EQUAL',
}

export enum FilterIntegrationOperator {
    EQUAL = 'EQUAL',
    BETWEEN = 'BETWEEN',
    IN = 'IN'
}