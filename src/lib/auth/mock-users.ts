import { ROLES } from "@/types/role.types";
import type { UserWithPassword } from "@/types/user.types";

/**
 * Usuarios mock para testing
 * Cada usuario tiene un rol diferente
 */
export const mockUsers: UserWithPassword[] = [
  {
    id: "1",
    email: "universitas@demo.com",
    password: "demo123",
    role: ROLES.UNIVERSITAS,
    name: "Dr. María González",
    avatar: "/avatars/universitas.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "2",
    email: "ente@demo.com",
    password: "demo123",
    role: ROLES.ENTE,
    name: "Ing. Carlos Mendoza",
    avatar: "/avatars/ente.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "3",
    email: "supervisor@demo.com",
    password: "demo123",
    role: ROLES.SUPERVISOR,
    name: "Lic. Ana Martínez",
    avatar: "/avatars/supervisor.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "4",
    email: "visualizador@demo.com",
    password: "demo123",
    role: ROLES.VISUALIZADOR,
    name: "Juan Pérez",
    avatar: "/avatars/visualizador.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "5",
    email: "ejecutor@demo.com",
    password: "demo123",
    role: ROLES.EJECUTOR,
    name: "Laura Ramírez",
    avatar: "/avatars/ejecutor.jpg",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
];

/**
 * Buscar usuario por email
 */
export function findUserByEmail(email: string): UserWithPassword | undefined {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Buscar usuario por ID
 */
export function findUserById(id: string): UserWithPassword | undefined {
  return mockUsers.find((user) => user.id === id);
}

/**
 * Validar credenciales
 */
export function validateCredentials(email: string, password: string): UserWithPassword | null {
  const user = findUserByEmail(email);

  if (!user) {
    return null;
  }

  // En producción, usar bcrypt para comparar hashes
  if (user.password !== password) {
    return null;
  }

  return user;
}
