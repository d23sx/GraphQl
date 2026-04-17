import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const ASSETS_DIR = path.join(ROOT_DIR, "assets");

app.use(express.json());
app.use(
    "/assets",
    express.static(ASSETS_DIR, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".css")) {
                res.type("text/css; charset=UTF-8");
            }
            if (filePath.endsWith(".js")) {
                res.type("application/javascript; charset=UTF-8");
            }
        },
    })
);

app.use(express.static(ROOT_DIR, { index: false }));

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const token = req.headers.authorization?.replace("Bearer ", "") || null;
            return { token };
        },
    });

    await server.start();

    server.applyMiddleware({ app, path: "/graphql" });

    app.get("*", (_req, res) => {
        res.sendFile(path.join(ROOT_DIR, "index.html"));
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
