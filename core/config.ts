
import { getUser } from "../utils/getUser";


export type UserConfig = {
  name?: string;
  email?: string;
};

export function getUserConfig() {
  const userConfig = getUser();

  if (!userConfig) {
    console.log("❌ No se encontró la configuración del usuario.");
  } else {
    console.log("👤 Información del usuario:");
    console.log(`- Nombre: ${userConfig.name || "No especificado"}`);
    console.log(`- Correo: ${userConfig.email || "No especificado"}`);
  }
}
