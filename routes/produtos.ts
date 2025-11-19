import { PrismaClient, Prisma } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()


const produtoSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  preco: z.string(), 
  estoque: z.number().int().nonnegative().default(0).optional(),
  ativo: z.boolean().default(true),
  imagem: z.string().url().optional(),
  categoriaId: z.number().int(), 
})

router.get("", async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany()
    return res.json(produtos)
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar produtos." })
  }
})

router.post("/", async (req, res) => {
  try {
    const novaData = produtoSchema.parse(req.body)
    const data = {
      ...novaData,
      preco: new Prisma.Decimal(novaData.preco),
    }
    const novoProduto = await prisma.produto.create({ data })
    return res.status(201).json(novoProduto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }
    return res.status(500).json({ error: "Erro ao criar produto." })
  }
})

router.patch("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const parsedData = produtoSchema.partial().parse(req.body)
    const data: any = {
      ...parsedData,
    }
    if (parsedData.preco !== undefined) {
      data.preco = new Prisma.Decimal(parsedData.preco)
    }
    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data,
    })
    return res.json(produtoAtualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }
    return res.status(500).json({ error: "Erro ao atualizar produto." })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    await prisma.produto.delete({
      where: { id },
    })
    return res.status(200).json({ message: "Produto removido com sucesso." })
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar produto." })
  }
})

export default router
