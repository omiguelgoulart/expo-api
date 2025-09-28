import { PrismaClient, Prisma  } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Router } from "express"
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const pedidoItemSchema = z.object({
    comanda: z.number().optional(),
    quantidade: z.number().int().nonnegative().default(1),
    precoUnitario: z.string(), // "42.90"
    subtotal: z.string(),      // "42.90"
    produtoId: z.number().int(), // obrigatório
    observacoes: z.string().optional(),
})

// rota get
router.get("/", async (req, res) => {
    try {
        const itens = await prisma.pedidoItem.findMany()
        res.json(itens)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar itens." })
    }
})

// rota post
router.post("/", async (req, res) => {
    try {
        const parsed = pedidoItemSchema.parse(req.body)
        const { produtoId, precoUnitario, subtotal, comanda, ...rest } = parsed
        const data: any = {
            ...rest,
            precoUnitario: new Prisma.Decimal(precoUnitario),
            subtotal: new Prisma.Decimal(subtotal),
            produto: { connect: { id: produtoId } },
        }
        if (comanda !== undefined) {
            data.comanda = { connect: { id: comanda } }
        }
        const novoItem = await prisma.pedidoItem.create({ data })
        return res.status(201).json(novoItem)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        return res.status(500).json({ message: "Erro ao criar item.", error: String((error as any)?.message ?? error) })
    }
})

// rota put
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." })
    try {
        const parsedData = pedidoItemSchema.partial().parse(req.body)
        const { produtoId, precoUnitario, subtotal, ...rest } = parsedData
        const data: any = { ...rest }
        if (produtoId !== undefined) {
            data.produto = { connect: { id: produtoId } }
        }
        if (precoUnitario !== undefined) {
            data.precoUnitario = new Prisma.Decimal(precoUnitario) // ou simplesmente: precoUnitario, se gerado aceitar string
        }
        if (subtotal !== undefined) {
            data.subtotal = new Prisma.Decimal(subtotal)           // ou simplesmente: subtotal, se gerado aceitar string
        }
        const itemAtualizado = await prisma.pedidoItem.update({
            where: { id: String(id) },
            data,
        })
        return res.json(itemAtualizado)
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        // trata P2025 caso pule o findUnique
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            return res.status(404).json({ message: "Item não encontrado." })
        } 
        return res.status(500).json({ message: "Erro ao atualizar item.", error: String(error.message ?? error) })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    await prisma.pedidoItem.delete({
      where: { id: String(id) }
    })
    res.status(200).json({ message: "Item deletado com sucesso." })
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar item." })
  }
})

export default router