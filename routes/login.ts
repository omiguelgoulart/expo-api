import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";

const router = Router();

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
});

router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  const mensaPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    return res.status(400).json({ erro: mensaPadrao });
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email },
      include: {
        empresa: true, // <- assume que tem relação usuario.empresa
      },
    });

    if (usuario == null) {
      return res.status(400).json({ erro: mensaPadrao });
    }

    const senhaConfere = bcrypt.compareSync(senha, usuario.senha);

    if (!senhaConfere) {
      return res.status(400).json({ erro: mensaPadrao });
    }

    // papel do usuário - no app vai ser sempre FUNCIONARIO (ajustado no cadastro)
    const papel = (usuario as any).papel ?? (usuario as any).role ?? "FUNCIONARIO";

    const empresaId = (usuario as any).empresaId ?? null;
    const empresaNome = (usuario as any).empresa?.nome ?? null;

    const token = jwt.sign(
      {
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome,
        papel,
        empresaId,
      },
      process.env.JWT_KEY as string,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel,
      empresaId,
      empresaNome,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ erro: "Erro interno ao fazer login" });
  }
});

export default router;
