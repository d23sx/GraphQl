import { queryResolvers } from "./resolvers/queryResolvers.js";
import { userResolvers } from "./resolvers/userResolvers.js";

export const resolvers = {
    Query: queryResolvers,
    User: userResolvers,
};
