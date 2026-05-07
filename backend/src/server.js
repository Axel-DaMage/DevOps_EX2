import dotenv from "dotenv";
import app from "./app.js";
import { checkDatabaseConnection } from "./db.js";

dotenv.config();

const port = Number(process.env.PORT || 3001);

async function startServer() {
  try {
    await checkDatabaseConnection();
    app.listen(port, () => {
      console.log(`Backend escuchando en puerto ${port}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar el backend:", error.message);
    process.exit(1);
  }
}

startServer();
