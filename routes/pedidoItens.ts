// routes/pedidoItem.ts
import { PrismaClient, Prisma } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

const pedidoItemSchema = z.object({
    comanda: z.number().optional(),
    quantidade: z.number().int().nonnegative().default(1),
    produtoId: z.string(),
    observacoes: z.string().optional(),
})

router.get("/", async (req, res) => {
    try {
        const itens = await prisma.pedidoItem.findMany({
            include: {
                produto: true,   // <--- importante pra ter nome, imagem, etc.
            },
        })
        res.json(itens)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erro ao buscar itens." })
    }
})

// rota POST
router.post("/", async (req, res) => {
    try {
        const parsed = pedidoItemSchema.parse(req.body)
        const { produtoId, comanda, ...rest } = parsed

        const data: any = {
            ...rest,
            produto: { connect: { id: produtoId } },
        }

        if (comanda !== undefined) {
            data.comanda = { connect: { id: comanda } }
        }

        const novoItem = await prisma.pedidoItem.create({ data })
        return res.status(201).json(novoItem)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res
                .status(400)
                .json({ message: "Dados inválidos.", errors: error.errors })
        }
        return res.status(500).json({
            message: "Erro ao criar item.",
            error: String((error as any)?.message ?? error),
        })
    }
})

// rota PATCH
router.patch("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const parsed = pedidoItemSchema.partial().parse(req.body)
        const { produtoId, precoUnitario, subtotal, comanda, ...rest } = parsed as any

        const data: any = { ...rest }

        if (precoUnitario !== undefined) {
            data.precoUnitario = new Prisma.Decimal(precoUnitario)
        }
        if (subtotal !== undefined) {
            data.subtotal = new Prisma.Decimal(subtotal)
        }
        if (produtoId !== undefined) {
            data.produto = { connect: { id: produtoId } }
        }
        if (comanda !== undefined) {
            data.comanda = { connect: { id: comanda } }
        }

        const pedidoAtualizado = await prisma.pedidoItem.update({
            where: { id: id },
            data,
        })

        res.json(pedidoAtualizado)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors })
        }
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return res.status(404).json({ error: "Item não encontrado." })
        }
        res.status(500).json({ error: "Erro ao atualizar item." })
    }
})

// rota DELETE
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        await prisma.pedidoItem.delete({
            where: { id: id },
        })
        res.status(200).json({ message: "Item deletado com sucesso." })
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar item." })
    }
})

export default router
