import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    type User {
        id: ID!
        login: String!
        email: String!
        campus: String
        totalUp: Float!
        totalDown: Float!
        totalUpBonus: Float
        public: PublicUserInfo!
        transactions(limit: Int, order_by: [TransactionOrderByInput!], where: TransactionFilter, distinct_on: [TransactionDistinctOn!]): [Transaction!]!
        transactions_aggregate(where: TransactionFilter, order_by: [TransactionOrderByInput!], distinct_on: [TransactionDistinctOn!]): TransactionAggregate!
        skills(limit: Int, order_by: [TransactionOrderByInput!], where: TransactionFilter, distinct_on: [TransactionDistinctOn!]): [Transaction!]!
        getEvent(where: UserEventFilter): [UserEvent!]!
    }

    type PublicUserInfo {
        id: ID!
        firstName: String!
        lastName: String!
    }

    type Transaction {
        id: ID!
        type: String!
        amount: Float!
        createdAt: String
        path: String
        eventId: ID
        userId: ID
        objectId: ID
    }

    type UserEvent {
        event: EventInfo
        createdAt: String
        eventId: ID
    }

    type EventInfo {
        path: String
    }

    type TransactionAggregate {
        aggregate: AggregateResult!
    }

    type AggregateResult {
        sum: AggregateSum
    }

    type AggregateSum {
        amount: Float
    }

    input TransactionFilter {
        type: StringFilter
        path: StringFilter
    }

    input UserEventFilter {
        event: EventFilter
    }

    input EventFilter {
        path: StringFilter
    }

    input StringFilter {
        _eq: String
        _neq: String
        _in: [String!]
        _regex: String
        _like: String
    }

    enum OrderDirection {
        asc
        desc
    }

    input TransactionOrderByInput {
        id: OrderDirection
        type: OrderDirection
        amount: OrderDirection
        createdAt: OrderDirection
        path: OrderDirection
        eventId: OrderDirection
        userId: OrderDirection
        objectId: OrderDirection
    }

    enum TransactionDistinctOn {
        id
        type
        amount
        createdAt
        path
        eventId
        userId
        objectId
    }

    type Query {
        user: User
        transaction(limit: Int, order_by: [TransactionOrderByInput!], where: TransactionFilter, distinct_on: [TransactionDistinctOn!]): [Transaction!]!
        xpOverTime(userId: ID!, eventId: ID!, createdAt: String!, path: String!, now: String): [Transaction!]!
    }
`;
