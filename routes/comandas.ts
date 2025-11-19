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


router.get("/:empresaId", async (req: Request<Pick<ComandaParams, "empresaId">>, res) => {
  const { empresaId } = req.params;

  if (!empresaId) {
    return res.status(400).json({ error: "empresaId não informado na rota." });
  }

  try {
    const comandas = await prisma.comanda.findMany({
      where: { empresaId },
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

router.post("/:empresaId", async (req: Request<Pick<ComandaParams, "empresaId">>, res) => {
  const { empresaId } = req.params;

  try {
    const parsedBody = comandaSchema.parse(req.body);

    const novaComanda = await prisma.comanda.create({
      data: {
        ...parsedBody,
        empresaId, // sempre forçando empresa da rota
      },
    });

    return res.status(201).json(novaComanda);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos.", errors: error.errors });
    }
    console.error("Erro no POST /comanda/:empresaId:", error);
    return res.status(500).json({
      message: "Erro ao criar comanda.",
      error: String((error as any)?.message ?? error),
    });
  }
});

router.get("/:empresaId/:id", async (req: Request<ComandaParams>, res) => {
  const { id, empresaId } = req.params;

  try {
    const comanda = await prisma.comanda.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        pedidos: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!comanda) {
      return res
        .status(404)
        .json({ message: "Comanda não encontrada para esta empresa." });
    }

    res.json(comanda);
  } catch (error) {
    console.error("Erro no GET /comanda/:empresaId/:id:", error);
    res.status(500).json({ error: "Erro ao buscar comanda." });
  }
});

router.patch("/:empresaId/:id", async (req: Request<ComandaParams>, res) => {
  const { id, empresaId } = req.params;

  try {
    const parsedData = comandaSchema.partial().parse(req.body);

    const existe = await prisma.comanda.findFirst({
      where: { id, empresaId },
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
    console.error("Erro no PATCH /comanda/:empresaId/:id:", error);
    res.status(500).json({ error: "Erro ao atualizar comanda." });
  }
});

router.delete("/:empresaId/:id", async (req: Request<ComandaParams>, res) => {
  const { id, empresaId } = req.params;

  try {
    const existe = await prisma.comanda.findFirst({
      where: { id, empresaId },
    });

    if (!existe) {
      return res
        .status(404)
        .json({ message: "Comanda não encontrada para esta empresa." });
    }

    await prisma.comanda.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Erro no DELETE /comanda/:empresaId/:id:", error);
    res.status(500).json({ error: "Erro ao deletar comanda." });
  }
});

export default router;
