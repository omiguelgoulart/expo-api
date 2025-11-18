import { PrismaClient } from "@prisma/client"
import { Router, Request } from "express"
import { z } from "zod"

const prisma = new PrismaClient()

interface ComandaParams {
  empresaId: string
  id?: string
}

// mergeParams TRUE → permite acessar empresaId vindo da rota pai
const router = Router({ mergeParams: true })

const comandaSchema = z.object({
  numero: z.string().min(1, "Identificador é obrigatório!!"),
  data: z.string().optional(),
  status: z.enum(["ABERTA", "FECHADA", "CANCELADA", "PENDENTE"]).default("ABERTA").optional(),
  usuarioId: z.string().optional(),
})

router.get("/", async (req: Request<ComandaParams>, res) => {
  const { empresaId } = req.params

  try {
    const comandas = await prisma.comanda.findMany({
      where: { empresaId },
      include: { pedidos: { include: { produto: true } } },
    })
    res.json(comandas)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comandas." })
  }
})


router.post("/", async (req: Request<ComandaParams>, res) => {
  const { empresaId } = req.params

  try {
    const parsedData = comandaSchema.parse(req.body)

    const novaComanda = await prisma.comanda.create({
      data: { ...parsedData, empresaId },
    })

    res.status(201).json(novaComanda)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }
    res.status(500).json({ error: "Erro ao criar comanda." })
  }
})

router.patch("/:id", async (req: Request<ComandaParams>, res) => {
  const { id, empresaId } = req.params

  try {
    const parsedData = comandaSchema.partial().parse(req.body)

    const existe = await prisma.comanda.findUnique({ where: { id } })
    if (!existe || existe.empresaId !== empresaId) {
      return res.status(404).json({ message: "Comanda não encontrada para esta empresa." })
    }

    const comandaAtualizada = await prisma.comanda.update({
      where: { id },
      data: parsedData,
    })

    res.json(comandaAtualizada)
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar comanda." })
  }
})

router.delete("/:id", async (req: Request<ComandaParams>, res) => {
  const { id, empresaId } = req.params

  try {
    const existe = await prisma.comanda.findUnique({ where: { id } })
    if (!existe || existe.empresaId !== empresaId) {
      return res.status(404).json({ message: "Comanda não encontrada para esta empresa." })
    }

    await prisma.comanda.delete({ where: { id } })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar comanda." })
  }
})

router.get("/:id", async (req: Request<ComandaParams>, res) => {
  const { id, empresaId } = req.params

  try {
    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: { pedidos: { include: { produto: true } } },
    })

    if (!comanda || comanda.empresaId !== empresaId) {
      return res.status(404).json({ message: "Comanda não encontrada para esta empresa." })
    }

    res.json(comanda)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comanda." })
  }
})

export default router
