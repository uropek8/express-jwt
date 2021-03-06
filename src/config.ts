import * as dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";

export const config = {
  environment: NODE_ENV,
  jwt: {
    secretAccess: process.env.JWT_SECRET_ACCESS || "SECRET_ACCESS",
    secretRefresh: process.env.JWT_SECRET_REFRESH || "SECRET_REFRESH",
    accessExp: Number(process.env.JWT_ACCESS_EXP || 3600), // Default to 1 hour
    refreshExp: Number(process.env.JWT_REFRESH_EXP || 604800), // Default to 1 week
  },
  db: {
    name: process.env.DB_NAME || "express",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "12345",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    get url(): string {
      return `mongodb+srv://${this.user}:${this.password}@cluster0.vtbez.mongodb.net/${this.name}?retryWrites=true&w=majority`;
    },
  },
  server: {
    port: process.env.SERVER_PORT || 3000,
  },
};
