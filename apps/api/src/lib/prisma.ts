import "../config/env.js";
import { createPrismaClient } from "@packages/prisma";

const prisma = createPrismaClient();

export default prisma;
export { prisma };
