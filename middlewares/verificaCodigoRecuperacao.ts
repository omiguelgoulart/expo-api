import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { isBefore } from "date-fns";

const prisma = new PrismaClient();

export async function verificaCodigoRecuperacao(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "E-mail e código são obrigatórios" });
  }

  try {
    const cliente = await prisma.cliente.findUnique({ where: { email } });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    if (cliente.resetToken !== codigo) {
      return res.status(400).json({ error: "Código inválido" });
    }

    if (
      !cliente.resetTokenExpires ||
      isBefore(new Date(cliente.resetTokenExpires), new Date())
    ) {
      return res.status(400).json({ error: "O código expirou" });
    }

    // Anexa o cliente ao body (opcional)
    req.body.cliente = cliente;

    next();
  } catch (error) {
    console.error("Erro na verificação de código:", error);
    res.status(500).json({ error: "Erro ao verificar o código de recuperação" });
  }
}
