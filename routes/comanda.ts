import { PrismaClient } from '@prisma/client'
import { z, ZodError } from 'zod'
import { Router } from 'express'

const prisma = new PrismaClient()
const router = Router()

const comandaSchema = z.object({
  numero: z.number().int().positive(),
  data: z.coerce.date(),
  status: z.enum(['ABERTA', 'FECHADA']),
  pedidos: z.array(
    z.object({
      codigo: z.number().int().positive(),
      quantidade: z.number().positive(),
      precoUnitario: z.number().nonnegative(),
    })
  ),
})




// GET /comandas
router.get('/', async (req, res) => {
  try {
    const comandas = await prisma.comanda.findMany({
      include: {
        pedidos: {
          include: { item: true }
        }
      },
    })
    res.json(comandas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao listar comandas' })
  }
})

// POST /comandas
router.post('/', async (req, res) => {
  try {
    const body = req.body

    const pedidosSchema = z.array(
      z.object({
        codigo: z.number().int().positive(),
        quantidade: z.number().positive(),
        precoUnitario: z.number().nonnegative(),
      })
    )

    const pedidos = pedidosSchema.parse(body.pedidos ?? [])

    // Busca o maior número já existente
    const ultimaComanda = await prisma.comanda.findFirst({
      orderBy: { numero: 'desc' },
    })

    const novoNumero = (ultimaComanda?.numero ?? 0) + 1

    // Busca os itens com base nos códigos
    const codigos = pedidos.map((p) => p.codigo)
    const itensEncontrados = await prisma.item.findMany({
      where: { codigo: { in: codigos } },
    })

    if (itensEncontrados.length !== codigos.length) {
      const encontrados = new Set(itensEncontrados.map((i) => i.codigo))
      const faltando = codigos.filter((c) => !encontrados.has(c))
      return res.status(400).json({ error: `Código(s) não encontrado(s): ${faltando.join(', ')}` })
    }

    const pedidosCriados = pedidos.map((pedido) => {
      const item = itensEncontrados.find((i) => i.codigo === pedido.codigo)
      return {
        itemId: item!.codigo,
        quantidade: pedido.quantidade,
        precoUnitario: pedido.precoUnitario,
        subtotal: pedido.quantidade * pedido.precoUnitario,
      }
    })

    const comanda = await prisma.comanda.create({
      data: {
        numero: novoNumero,
        data: new Date(),
        status: body.status ?? 'ABERTA',
        pedidos: {
          create: pedidosCriados,
        },
      },
      include: {
        pedidos: {
          include: { item: true },
        },
      },
    })

    res.status(201).json(comanda)
  } catch (error) {
    console.error(error)
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.format() })
    }
    res.status(500).json({ error: 'Erro ao criar comanda' })
  }
})


// PATCH /comandas/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const parsedData = comandaSchema.parse(req.body)

    // Busca os itens com base nos códigos informados
    const codigos = parsedData.pedidos.map(p => p.codigo)
    const itensEncontrados = await prisma.item.findMany({
      where: { codigo: { in: codigos } },
    })

    // Verifica se todos os códigos foram encontrados
    if (itensEncontrados.length !== codigos.length) {
      const encontrados = new Set(itensEncontrados.map(i => i.codigo))
      const faltando = codigos.filter(c => !encontrados.has(c))
      return res.status(400).json({ error: `Código(s) não encontrado(s): ${faltando.join(', ')}` })
    }

    const pedidosUpsert = parsedData.pedidos.map((p) => {
      const item = itensEncontrados.find(i => i.codigo === p.codigo)
      return {
        where: {
          comandaId_itemId: {
            comandaId: Number(id),
            itemId: item!.codigo,
          } as any,
        },
        update: {
          quantidade: p.quantidade,
          precoUnitario: p.precoUnitario,
          subtotal: p.quantidade * p.precoUnitario,
        },
        create: {
          itemId: item!.codigo,
          quantidade: p.quantidade,
          precoUnitario: p.precoUnitario,
          subtotal: p.quantidade * p.precoUnitario,
        },
      }
    })

    const comanda = await prisma.comanda.update({
      where: { id: Number(id) },
      data: {
        numero: parsedData.numero,
        data: parsedData.data,
        status: parsedData.status,
        pedidos: {
          upsert: pedidosUpsert,
        },
      },
      include: {
        pedidos: {
          include: { item: true }
        }
      },
    })

    res.json(comanda)
  } catch (error) {
    console.error(error)
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error })
    }
    res.status(500).json({ error: 'Erro ao atualizar comanda' })
  }
})

// DELETE /comandas/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.comanda.delete({
      where: { id: Number(id) },
    })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao deletar comanda' })
  }
})

// GET /comandas/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const comanda = await prisma.comanda.findUnique({
      where: { id: Number(id) },
      include: {
        pedidos: {
          include: { item: true }
        }
      },
    })

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda não encontrada' })
    }

    res.json(comanda)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar comanda' })
  }
})

// PATCH /comandas/:id/status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !['ABERTA', 'FECHADA'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido. Deve ser ABERTA ou FECHADA.' })
  }

  try {
    const comanda = await prisma.comanda.update({
      where: { id: Number(id) },
      data: { status },
    })

    res.json(comanda)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar status da comanda' })
  }
})

export default router
