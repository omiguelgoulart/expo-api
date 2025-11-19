import { PrismaClient } from "@prisma/client";
import { Router, Request } from "express";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

interface ComandaParams {
  empresaId: string;
  id: string;
}

const comandaSchema = z.object({
  numero: z.string().min(1, "Identificador é obrigatório!!"),
  data: z.string().optional(),
  status: z
    .enum(["ABERTA", "FECHADA", "CANCELADA", "PENDENTE"])
    .default("ABERTA")
    .optional(),
  usuarioId: z.string().optional(),
});


router.get("/", async (req, res) => {
   try {
    const comandas = await prisma.comanda.findMany({
      where: {},
      include: {
        // aqui "pedidos" já vem com produto
        pedidos: {
          include: {
            produto: true,
          },
        },
      },
    });

    res.json(comandas);
  } catch (error) {
    console.error("Erro no GET /comanda/:empresaId:", error);
    res.status(500).json({ error: "Erro ao buscar comandas." });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = comandaSchema.parse(req.body);
    const novoData = parsed.data ? new Date(parsed.data) : new Date();

    const data = {
      ...parsed,
      data: novoData,
    };
    const novaComanda = await prisma.comanda.create({ data });
    return res.status(201).json(novaComanda);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      message: "Erro ao criar comanda.",
      error: String((error as any)?.message ?? error),
    });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: {
        pedidos: {
          include: {
            produto: true,
          },
        },
      },
    });
    if (!comanda) {
      return res.status(404).json({ message: "Comanda não encontrada." });
    }
    res.json(comanda);
  } catch (error) {
    console.error("Erro no GET /comanda/:id:", error);
    res.status(500).json({ error: "Erro ao buscar comanda." });
  }
});

router.patch("/editar/:empresaId/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const parsedData = comandaSchema.partial().parse(req.body);

    const existe = await prisma.comanda.findFirst({
      where: { id },
    });

    if (!existe) {
      return res
        .status(404)
        .json({ message: "Comanda não encontrada para esta empresa." });
    }

    const comandaAtualizada = await prisma.comanda.update({
      where: { id },
      data: parsedData,
    });

    res.json(comandaAtualizada);
  } catch (error) {
    console.error("Erro no PATCH /comanda/:id:", error);
    res.status(500).json({ error: "Erro ao atualizar comanda." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existe = await prisma.comanda.findFirst({
      where: { id },
    });

    if (!existe) {
      return res
        .status(404)
        .json({ message: "Comanda não encontrada para esta empresa." });
    }

    await prisma.comanda.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Erro no DELETE /comanda/:id:", error);
    res.status(500).json({ error: "Erro ao deletar comanda." });
  }
});

export default router;
