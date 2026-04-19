import { PLATFORM_ENDPOIINT } from "../config.js";

export async function fetchFromPlatform(query, variables = {}, token) {
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
