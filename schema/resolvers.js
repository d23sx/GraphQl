import { PLATFORM_ENDPOIINT } from "../config.js";

async function fetchFromPlatform(query, variables = {}, token) {
    try {
        const response = await fetch(PLATFORM_ENDPOIINT, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/graphql-response+json",
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            throw new Error(`Platform API error: ${response.statusText}`);
        }
    
        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0]?.message || "GraphQL error");
        }
        return data.data;
    } catch (error) {
        console.error("Platform API fetch failed:", error);
        throw error;
    }
}

export const resolvers = {
    Query: {
        user: async (_, __, { token }) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            const query = `
                query {
                    user {
                        id
                        login
                        email
                        campus
                        totalUp
                        totalDown
                        totalUpBonus
                        public {
                            id
                            firstName
                            lastName
                        }
                    }
                }
            `;

            const result = await fetchFromPlatform(query, {}, token);
            const user = result.user[0];

            user.level = Math.floor(user.totalUp / 5000);

            return user;
        },

        transaction: async (
            _,
            { limit, order_by = DEFAULT_TRANSACTION_ORDER, where, distinct_on },
            { token },
        ) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            try {
                return await fetchUserTransactions({
                    token,
                    limit,
                    order_by,
                    where,
                    distinct_on,
                });
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
                return [];
            }
        },

        xpOverTime: async (
            _,
            { userId, eventId, createdAt, path, now },
            { token },
        ) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            try {
                return await fetchXpOverTimeTransactions({
                    token,
                    userId,
                    eventId,
                    createdAt,
                    path,
                    now,
                });
            } catch (error) {
                console.error("Failed to fetch xpOverTime:", error);
                return [];
            }
        },
    },

    User: {
        transactions: async (
            user,
            {
                limit = 10,
                order_by = DEFAULT_USER_TRANSACTION_ORDER,
                where,
                distinct_on,
            },
            { token },
        ) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            try {
                return await fetchUserTransactions({
                    token,
                    limit,
                    order_by,
                    where,
                    distinct_on,
                });
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                return [];
            }
        },

        transactions_aggregate: async (
            user,
            { order_by = DEFAULT_TRANSACTION_ORDER, where, distinct_on },
            { token },
        ) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            try {
                const transactions = await fetchUserTransactions({
                    token,
                    order_by,
                    where,
                    distinct_on,
                    fields: ["amount"],
                });
                const total = transactions.reduce(
                    (sum, tx) => sum + (Number(tx.amount) || 0),
                    0,
                );

                return {
                    aggregate: {
                        sum: {
                            amount: total,
                        },
                    },
                };
            } catch (error) {
                console.error("Failed to fetch transactions aggregate:", error);
                return {
                    aggregate: {
                        sum: {
                            amount: 0,
                        },
                    },
                };
            }
        },

        skills: async (
            user,
            {
                limit,
                order_by = DEFAULT_SKILLS_ORDER,
                where = DEFAULT_SKILLS_FILTER,
                distinct_on = DEFAULT_SKILLS_DISTINCT_ON,
            },
            { token },
        ) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            try {
                return await fetchUserTransactions({
                    token,
                    limit,
                    order_by,
                    where: mergeSkillWhere(where),
                    distinct_on,
                });
            } catch (error) {
                console.error("Failed to fetch skills:", error);
                return [];
            }
        },

        getEvent: async (user, { where }, { token }) => {
            if (!token) {
                throw new Error("Missing authentication token");
            }

            try {
                return await fetchUserEvents({ token, where });
            } catch (error) {
                console.error("Failed to fetch getEvent:", error);
                return [];
            }
        },
    },
};

const TRANSACTION_COLUMNS = new Set([
    "id",
    "type",
    "amount",
    "createdAt",
    "path",
    "eventId",
    "userId",
    "objectId",
]);
const ORDER_DIRECTIONS = new Set(["asc", "desc"]);
const DEFAULT_TRANSACTION_FIELDS = [
    "id",
    "type",
    "amount",
    "createdAt",
    "path",
    "eventId",
    "userId",
    "objectId",
];
const DEFAULT_TRANSACTION_ORDER = [{ createdAt: "asc" }];
const DEFAULT_USER_TRANSACTION_ORDER = [{ amount: "desc" }];
const DEFAULT_SKILLS_ORDER = [{ type: "desc" }, { amount: "desc" }];
const DEFAULT_SKILLS_DISTINCT_ON = ["type"];
const DEFAULT_SKILLS_FILTER = { type: { _like: "skill_%" } };

function mergeSkillWhere(where = {}) {
    return {
        ...where,
        type: {
            ...DEFAULT_SKILLS_FILTER.type,
            ...(where?.type || {}),
        },
    };
}

function buildTransactionsSelection(fields = DEFAULT_TRANSACTION_FIELDS) {
    return fields
        .map((field) => `${field}`)
        .join("\n");
}

async function fetchUserTransactions({
    token,
    limit,
    order_by,
    where,
    distinct_on,
    fields = DEFAULT_TRANSACTION_FIELDS,
}) {
    const args = buildTransactionsArgs({ limit, order_by, where, distinct_on });
    const query = `
                query {
                    user {
                        transactions${args} {
                            ${buildTransactionsSelection(fields)}
                        }
                    }
                }
            `;

    const result = await fetchFromPlatform(query, {}, token);
    return result.user[0]?.transactions || [];
}

async function fetchUserEvents({ token, where }) {
    const args = buildGetEventArgs({ where });
    const query = `
                query {
                    user {
                        events${args} {
                            event {
                                path
                            }
                            createdAt
                            eventId
                        }
                    }
                }
            `;

    const result = await fetchFromPlatform(query, {}, token);
    return result.user[0]?.events || [];
}

async function fetchXpOverTimeTransactions({
    token,
    userId,
    eventId,
    createdAt,
    path,
    now,
}) {
    const parsedUserId = Number(userId);
    const parsedEventId = Number(eventId);

    if (!Number.isFinite(parsedUserId) || !Number.isFinite(parsedEventId)) {
        return [];
    }

    const createdAtValue = serializeGraphQLString(createdAt);
    const nowValue = serializeGraphQLString(now || new Date().toISOString());
    const pathRegexValue = serializeGraphQLString(buildXpPathRegex(path));

    const query = `
                query {
                    transaction(
                        where: {_and: [{userId: {_eq: ${parsedUserId}}}, {createdAt: {_gte: ${createdAtValue}}}, {createdAt: {_lte: ${nowValue}}}, {path: {_regex: ${pathRegexValue}}}, {type: {_eq: "xp"}}, {_or: [{eventId: {_eq: ${parsedEventId}}}, {_and: [{event: {parentId: {_eq: ${parsedEventId}}}}, {event: {object: {type: {_nin: ["module", "piscine"]}}}}]}]}]}
                        order_by: {createdAt: asc}
                    ) {
                        id
                        eventId
                        path
                        amount
                        createdAt
                        userId
                        objectId
                    }
                }
            `;

    const result = await fetchFromPlatform(query, {}, token);
    return result.transaction || [];
}

function buildXpPathRegex(path) {
    const safePath = String(path || "").trim();
    if (!safePath) {
        return "^/bahrain/bh-module/(?:[^/]+|checkpoint/[^/]+)$";
    }

    const escapedPath = safePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return `^${escapedPath}/(?:[^/]+|checkpoint/[^/]+)$`;
}

function buildTransactionsArgs({ limit, order_by, where, distinct_on } = {}) {
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

function buildGetEventArgs({ where } = {}) {
    const args = [];

    const whereClause = buildGetEventWhereClause(where);
    if (whereClause) {
        args.push(`where: {${whereClause}}`);
    }

    return args.length ? `(${args.join(" ")})` : "";
}

function buildWhereClause(filter) {
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

function buildGetEventWhereClause(filter) {
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

function buildStringFilterClause(field, value = {}) {
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

function serializeGraphQLString(value) {
    return JSON.stringify(String(value));
}

function buildOrderByInput(orderBy = []) {
    const orderByItems = Array.isArray(orderBy) ? orderBy : [orderBy];
    const orderByClauses = orderByItems
        .filter((item) => item && typeof item === "object")
        .map((item) =>
            Object.entries(item)
                .filter(
                    ([key, direction]) =>
                        TRANSACTION_COLUMNS.has(key) && ORDER_DIRECTIONS.has(direction),
                )
                .map(([key, direction]) => `${key}: ${direction}`)
                .join(", "),
        )
        .filter(Boolean)
        .map((clause) => `{${clause}}`);

    return orderByClauses.length ? `[${orderByClauses.join(", ")}]` : "";
}

function buildDistinctOnInput(distinctOn = []) {
    const distinctColumns = (
        Array.isArray(distinctOn) ? distinctOn : [distinctOn]
    ).filter((column) => TRANSACTION_COLUMNS.has(column));

    return distinctColumns.length ? `[${distinctColumns.join(", ")}]` : "";
}
