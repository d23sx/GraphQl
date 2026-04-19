export const TRANSACTION_COLUMNS = Object.freeze([
    "id",
    "type",
    "amount",
    "createdAt",
    "path",
    "eventId",
    "userId",
    "objectId",
]);

export const TRANSACTION_COLUMNS_SET = new Set(TRANSACTION_COLUMNS);
export const ORDER_DIRECTIONS = new Set(["asc", "desc"]);

export const DEFAULT_TRANSACTION_FIELDS = TRANSACTION_COLUMNS;
export const DEFAULT_TRANSACTION_ORDER = [{ createdAt: "asc" }];
export const DEFAULT_USER_TRANSACTION_ORDER = [{ amount: "desc" }];
export const DEFAULT_SKILLS_ORDER = [{ type: "desc" }, { amount: "desc" }];
export const DEFAULT_SKILLS_DISTINCT_ON = ["type"];
export const DEFAULT_SKILLS_FILTER = { type: { _like: "skill_%" } };
