import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()
const router = Router()

const pedidoSchema = z.object({
    codigo: z.number().int().positive(),
    quantidade: z.number().positive(),
    precoUnitario: z.number().nonnegative().optional(),
    })

// GET /pedidos
router.get('/', async (req, res) => {
    try {
        const pedidos = await prisma.pedidoItem.findMany({
        include: { item: true },
        })
        res.json(pedidos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao listar pedidos' })
    }
    })

// POST /pedidos
router.post('/', async (req, res) => {
    try {
        const data = pedidoSchema.parse(req.body)

        // Adapte os campos abaixo conforme o seu modelo PedidoItem no Prisma
        const pedido = await prisma.pedidoItem.create({
            data: {
                quantidade: data.quantidade,
                precoUnitario: data.precoUnitario ?? 0,
                subtotal: (data.precoUnitario ?? 0) * data.quantidade,
                comanda: { connect: { id: req.body.comandaId } }, // ajuste conforme seu modelo
                item: { connect: { codigo: data.codigo } }, // ajuste conforme seu modelo
            },
        })

        res.status(201).json(pedido)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error(error)
        res.status(500).json({ error: 'Erro ao cadastrar pedido' })
    }
})

// PATCH /pedidos/:codigo
router.patch('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const data = pedidoSchema.parse(req.body)

        const pedido = await prisma.pedidoItem.update({
            where: { id },
            data,
        })

        res.json(pedido)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error(error)
        res.status(500).json({ error: 'Erro ao atualizar pedido' })
    }
})

// DELETE /pedidos/:codigo
router.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {
        await prisma.pedidoItem.delete({
            where: { id },
        })
        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao deletar pedido' })
    }
})

export default router