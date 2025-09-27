import { Router } from 'express'
import { z, ZodError } from 'zod'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
const router = Router()

const cadastrarItemSchema = z.object({
  comandaId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantidade: z.number().positive(),
  precoUnitario: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
})

// POST /itens
router.post("/", async (req, res) => {
  const { comandaId, codigo, quantidade, precoUnitario } = req.body
  const item = await prisma.item.findUnique({ where: { codigo } })
  if (!item) return res.status(404).json({ error: "Item não encontrado" })

  const preco = precoUnitario ?? item.preco
  const existing = await prisma.pedidoItem.findUnique({
    where: { comandaId_itemId: { comandaId, itemId: codigo } },
  })

  const pedido = await prisma.pedidoItem.upsert({
    where: { comandaId_itemId: { comandaId, itemId: codigo } },
    update: {
      quantidade: (existing?.quantidade ?? 0) + quantidade,
      precoUnitario: preco,
      subtotal: ((existing?.quantidade ?? 0) + quantidade) * preco,
    },
    create: {
      comandaId,
      itemId: codigo,
      quantidade,
      precoUnitario: preco,
      subtotal: quantidade * preco,
    },
    include: { item: true },
  })

  res.status(existing ? 200 : 201).json(pedido)
})

// PATCH /itens/:id
router.patch('/:codigo', async (req, res) => {
  const { codigo } = req.params

  try {
    const data = cadastrarItemSchema.parse(req.body)

    const item = await prisma.item.update({
      where: { codigo: Number(codigo) },
      data,
    })

    res.json(item)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error })
    }
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed on the fields: (`codigo`)')
    ) {
      return res.status(400).json({ error: 'Já existe um item com esse código.' })
    }

    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar item' })
  }
})

// DELETE /itens/:id
router.delete('/:codigo', async (req, res) => {
  const { codigo } = req.params
  try {
    await prisma.item.delete({
      where: { codigo: Number(codigo) },
    })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao deletar item' })
  }
})

// GET /itens
router.get('/', async (req, res) => {
  try {
    const itens = await prisma.item.findMany({
      orderBy: { codigo: 'asc' },
    })
    res.json(itens)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao listar itens' })
  }
})

// GET /itens/:codigo
router.get('/codigo/:codigo', async (req, res) => {
  const { codigo } = req.params
  try {
    const item = await prisma.item.findUnique({
      where: { codigo: Number(codigo) },
    })
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' })
    }
    res.json(item)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar item' })
  }
})

export default router
