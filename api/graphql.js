export async function fetchUserGraphql() {
    const auth = localStorage.getItem('jwt');

    if (!auth) {
        throw new Error('No authentication token found');
    }

    try {
        const data = await executeGraphqlRequest(auth, `
            query {
                user {
                    id
                    login
                    email
                    campus
                    totalUp
                    totalDown
                    public {
                        id
                        firstName
                        lastName
                    }
                    transactions(limit: 1, order_by: {amount: desc}, where: { type: { _eq: "level" } }) {
                        amount
                    }
                    skills(
                        order_by: [{ type: desc }, { amount: desc }]
                        distinct_on: [type]
                        where: { type: { _like: "skill_%" } }
                    ) {
                        type
                        amount
                    }
                    transactions_aggregate(
                        where: {type: {_eq: "xp"}, path: {_regex: "^/bahrain/bh-module/(?:[^/]+|checkpoint/[^/]+)$"}}
                        order_by: {createdAt: asc}
                    ) {
                        aggregate {
                            sum {
                                amount
                            }
                        }
                    }
                    getEvent(where: {event: {path: {_eq: "/bahrain/bh-module"}}}) {
                        event {
                            path
                        }
                        createdAt
                        eventId
                    }
                }
            }
        `);

        const user = data?.user || {};
        const seed = pickEventSeed(user?.getEvent);
        const xpOverTime = seed
            ? await fetchXpOverTime(auth, {
                userId: user?.id,
                eventId: seed.eventId,
                createdAt: seed.createdAt,
                path: seed.path,
            })
            : [];

        console.log('User data fetched successfully:', { ...data, xpOverTime });
        return {
            ...user,
            transaction: xpOverTime,
            xpOverTime,
            transactions_aggregate: user.transactions_aggregate,
        };
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error;
    }
}

async function executeGraphqlRequest(auth, query, variables = {}) {
    const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();

    if (!response.ok) {
        const details = payload?.errors?.[0]?.message || response.statusText;
        throw new Error('Query failed: ' + details);
    }

    if (payload?.errors?.length) {
        throw new Error(payload.errors[0]?.message || 'GraphQL error');
    }

    return payload?.data || {};
}

async function fetchXpOverTime(auth, { userId, eventId, createdAt, path }) {
    if (userId == null || eventId == null || !createdAt || !path) {
        return [];
    }

    const data = await executeGraphqlRequest(
        auth,
        `
            query ($userId: ID!, $eventId: ID!, $createdAt: String!, $path: String!, $now: String!) {
                xpOverTime(userId: $userId, eventId: $eventId, createdAt: $createdAt, path: $path, now: $now) {
                    id
                    eventId
                    path
                    amount
                    createdAt
                    userId
                    objectId
                }
            }
        `,
        {
            userId: (userId),
            eventId: (eventId),
            createdAt,
            path,
            now: new Date().toISOString(),
        },
    );
    return data?.xpOverTime || [];
}

function normalizeEventRows(getEventRows = []) {
    if (!Array.isArray(getEventRows)) {
        return [];
    }

    return getEventRows
        .map((row) => ({
            eventId: row?.eventId,
            path: typeof row?.event?.path === 'string' ? row.event.path : '',
            createdAtMs: Date.parse(row?.createdAt ?? ''),
        }))
        .filter(
            (row) => row.path || row.eventId != null || Number.isFinite(row.createdAtMs),
        );
}

function pickEventSeed(getEventRows = []) {
    const normalized = normalizeEventRows(getEventRows)
        .filter((row) => row.eventId != null && Number.isFinite(row.createdAtMs))
        .sort((a, b) => a.createdAtMs - b.createdAtMs);

    if (normalized.length === 0) {
        return null;
    }

    return {
        eventId: normalized[0].eventId,
        createdAt: new Date(normalized[0].createdAtMs).toISOString(),
        path: normalized[0].path,
    };
}
