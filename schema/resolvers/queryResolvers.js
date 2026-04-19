import { DEFAULT_TRANSACTION_ORDER } from "../../constants/transactions.js";
import { fetchFromPlatform } from "../../services/platformClient.js";
import {
    fetchUserTransactions,
    fetchXpOverTimeTransactions,
} from "../../services/transactionsService.js";

export const queryResolvers = {
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
};
