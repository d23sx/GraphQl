import { buildGetEventArgs } from "../utils/graphqlArgs.js";
import { fetchFromPlatform } from "./platformClient.js";

export async function fetchUserEvents({ token, where }) {
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
