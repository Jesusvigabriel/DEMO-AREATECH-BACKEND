import { User } from "../entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        idEmpresa: number;
        // Agrega otras propiedades del usuario según sea necesario
      };
    }
  }
}
