import {
    ORDER_DIRECTIONS,
    TRANSACTION_COLUMNS_SET,
} from "../constants/transactions.js";

export function buildXpPathRegex(path) {
    const safePath = String(path || "").trim();
    if (!safePath) {
        return "^/bahrain/bh-module/(?:[^/]+|checkpoint/[^/]+)$";
    }

    const escapedPath = safePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return `^${escapedPath}/(?:[^/]+|checkpoint/[^/]+)$`;
}

export function buildTransactionsArgs({ limit, order_by, where, distinct_on } = {}) {
    const args = [];

    if (typeof limit === "number") {
        args.push(`limit: ${limit}`);
    }

    const orderByClause = buildOrderByInput(order_by);
    if (orderByClause) {
        args.push(`order_by: ${orderByClause}`);
    }

    const whereClause = buildWhereClause(where);
    if (whereClause) {
        args.push(`where: {${whereClause}}`);
    }

    const distinctOnClause = buildDistinctOnInput(distinct_on);
    if (distinctOnClause) {
        args.push(`distinct_on: ${distinctOnClause}`);
    }

    return args.length ? `(${args.join(" ")})` : "";
}

export function buildGetEventArgs({ where } = {}) {
    const args = [];

    const whereClause = buildGetEventWhereClause(where);
    if (whereClause) {
        args.push(`where: {${whereClause}}`);
    }

    return args.length ? `(${args.join(" ")})` : "";
}

export function buildWhereClause(filter) {
    if (!filter) return "";

    const clauses = [];
    const typeClause = buildStringFilterClause("type", filter.type);
    const pathClause = buildStringFilterClause("path", filter.path);

    if (typeClause) {
        clauses.push(typeClause);
    }
    if (pathClause) {
        clauses.push(pathClause);
    }

    return clauses.join(", ");
}

export function buildGetEventWhereClause(filter) {
    if (!filter || typeof filter !== "object") {
        return "";
    }

    if (!filter.event || typeof filter.event !== "object") {
        return "";
    }

    const eventClauses = [];
    const pathClause = buildStringFilterClause("path", filter.event.path);

    if (pathClause) {
        eventClauses.push(pathClause);
    }

    if (eventClauses.length === 0) {
        return "";
    }

    return `event: { ${eventClauses.join(", ")} }`;
}

export function buildStringFilterClause(field, value = {}) {
    if (!value || typeof value !== "object") {
        return "";
    }

    const operators = [];

    if (typeof value._eq === "string") {
        operators.push(`_eq: ${serializeGraphQLString(value._eq)}`);
    }
    if (typeof value._neq === "string") {
        operators.push(`_neq: ${serializeGraphQLString(value._neq)}`);
    }
    if (Array.isArray(value._in) && value._in.length > 0) {
        const values = value._in
            .map((item) => serializeGraphQLString(item))
            .join(", ");
        operators.push(`_in: [${values}]`);
    }
    if (typeof value._regex === "string") {
        operators.push(`_regex: ${serializeGraphQLString(value._regex)}`);
    }
    if (typeof value._like === "string") {
        operators.push(`_like: ${serializeGraphQLString(value._like)}`);
    }

    if (operators.length === 0) {
        return "";
    }

    return `${field}: { ${operators.join(", ")} }`;
}

export function serializeGraphQLString(value) {
    return JSON.stringify(String(value));
}

export function buildOrderByInput(orderBy = []) {
    const orderByItems = Array.isArray(orderBy) ? orderBy : [orderBy];
    const orderByClauses = orderByItems
        .filter((item) => item && typeof item === "object")
        .map((item) =>
            Object.entries(item)
                .filter(
                    ([key, direction]) =>
                        TRANSACTION_COLUMNS_SET.has(key) &&
                        ORDER_DIRECTIONS.has(direction),
                )
                .map(([key, direction]) => `${key}: ${direction}`)
                .join(", "),
        )
        .filter(Boolean)
        .map((clause) => `{${clause}}`);

    return orderByClauses.length ? `[${orderByClauses.join(", ")}]` : "";
}

export function buildDistinctOnInput(distinctOn = []) {
    const distinctColumns = (
        Array.isArray(distinctOn) ? distinctOn : [distinctOn]
    ).filter((column) => TRANSACTION_COLUMNS_SET.has(column));

    return distinctColumns.length ? `[${distinctColumns.join(", ")}]` : "";
}
