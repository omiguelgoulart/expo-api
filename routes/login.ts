import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt"; // se estiver usando bcryptjs, troque o import

const router = Router();

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
});

router.post("/", async (req: Request, res: Response) => {
  const { email, senha } = req.body as { email?: string; senha?: string };

  const mensaPadrao = "Login ou senha incorretos";

  // validação básica do body
  if (!email || !senha) {
    return res.status(400).json({ erro: mensaPadrao });
  }

  try {
    // busca usuário pelo e-mail
    const usuario = await prisma.usuario.findFirst({
      where: { email },
      // se você precisar de dados da empresa no response, inclua:
      // include: { empresa: true },
    });

    if (!usuario) {
      // usuário não encontrado
      return res.status(401).json({ erro: mensaPadrao });
    }

    // ATENÇÃO: confira se o campo da senha no seu banco é "senha" mesmo
    // se for "senhaHash" ou algo assim, ajuste aqui.
    if (!usuario.senha) {
      console.error(
        "Campo de senha não encontrado no usuário. Verifique o schema/coluna."
      );
      return res.status(500).json({
        erro: "Configuração de senha inválida no servidor",
      });
    }

    // compara a senha informada com o hash salvo
    const senhaConfere = await bcrypt.compare(senha, usuario.senha);

    if (!senhaConfere) {
      return res.status(401).json({ erro: mensaPadrao });
    }

    // papel do usuário - no app vai ser sempre FUNCIONARIO (ajustado no cadastro)
    const papel =
      (usuario as any).papel ?? (usuario as any).role ?? "FUNCIONARIO";

    // se você realmente precisar desses valores, pode mandar no response
    const empresaId = (usuario as any).empresaId ?? null;
    const empresaNome = (usuario as any).empresa?.nome ?? null;

    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      console.error("JWT_KEY não configurado nas variáveis de ambiente.");
      return res
        .status(500)
        .json({ erro: "Configuração do servidor inválida (JWT)." });
    }

    const token = jwt.sign(
      {
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome,
        papel,
        empresaId,
      },
      jwtKey,
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
