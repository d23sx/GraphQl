import {
    DEFAULT_SKILLS_DISTINCT_ON,
    DEFAULT_SKILLS_FILTER,
    DEFAULT_SKILLS_ORDER,
    DEFAULT_TRANSACTION_ORDER,
    DEFAULT_USER_TRANSACTION_ORDER,
} from "../../constants/transactions.js";
import { fetchUserEvents } from "../../services/eventsService.js";
import {
    fetchUserTransactions,
    mergeSkillWhere,
} from "../../services/transactionsService.js";

export const userResolvers = {
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
};
