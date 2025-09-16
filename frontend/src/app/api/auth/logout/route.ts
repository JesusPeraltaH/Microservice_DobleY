import { NextResponse } from 'next/server';

export async function POST() {
  // Este endpoint es principalmente para limpieza del lado del servidor
  // La mayoría de la lógica de logout está del lado del cliente
  return NextResponse.json({ message: 'Logged out successfully' });
}