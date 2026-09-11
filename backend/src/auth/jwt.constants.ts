export const jwtConstants = {
  expiresIn: '8h',
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado no backend/.env');
  }

  return secret;
}