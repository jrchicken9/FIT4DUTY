import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .query(() => {
    return {
      status: "ok",
      message: "Backend is running successfully",
      timestamp: new Date(),
      version: "1.0.0",
    };
  });