import {
    DEFAULT_SKILLS_FILTER,
    DEFAULT_TRANSACTION_FIELDS,
} from "../constants/transactions.js";
import {
    buildTransactionsArgs,
    buildXpPathRegex,
    serializeGraphQLString,
} from "../utils/graphqlArgs.js";
import { fetchFromPlatform } from "./platformClient.js";

export function mergeSkillWhere(where = {}) {
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

export async function fetchUserTransactions({
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

export async function fetchXpOverTimeTransactions({
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
