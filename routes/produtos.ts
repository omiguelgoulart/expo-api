import { PrismaClient, Prisma } from "@prisma/client"
import { Router } from "express"
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

// Exemplo de schema Zod (ajuste ao seu)
const produtoSchema = z.object({
    nome: z.string().min(1),
    descricao: z.string().optional(),
    preco: z.string(), // "42.90"
    estoque: z.number().int().nonnegative().default(0).optional(),
    ativo: z.boolean().default(true),
    imagem: z.string().url().optional(),
    categoriaId: z.number().int(), // obrigatório
    empresaId: z.string().min(1),  // obrigatório
})

// rota get
router.get("/", async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany()
        res.json(produtos)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar produtos." })
    }
})

// rota post
router.post("/", async (req, res) => {
    try {
        const parsed = produtoSchema.parse(req.body)
        const { categoriaId, preco, empresaId, ...rest } = parsed

        const data: Prisma.ProdutoCreateInput = {
            ...rest,
            preco: new Prisma.Decimal(preco),    // ou simplesmente: preco, se gerado aceitar string
            categoria: { connect: { id: categoriaId } },
            empresa: { connect: { id: empresaId } },
        }

        const novoProduto = await prisma.produto.create({ data })
        return res.status(201).json(novoProduto)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        return res.status(500).json({ message: "Erro ao criar produto.", error: String((error as any)?.message ?? error) })
    }
})

// rota patch
router.patch("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const parsed = produtoSchema.partial().parse(req.body)
        const { categoriaId, preco, empresaId, ...rest } = parsed
        const data: Prisma.ProdutoUpdateInput = {
            ...rest,
            ...(preco !== undefined && { preco: new Prisma.Decimal(preco) }),
            ...(categoriaId !== undefined && { categoria: { connect: { id: categoriaId } } }),
            ...(empresaId !== undefined && { empresa: { connect: { id: empresaId } } }),
        }
        const produtoAtualizado = await prisma.produto.update({
            where: { id: id },
            data
        })
        res.json(produtoAtualizado)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors })
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Produto não encontrado." })
        }
        res.status(500).json({ error: "Erro ao atualizar produto." })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        await prisma.produto.delete({
            where: { id: id }
        })
        res.status(204).send()
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Produto não encontrado." })
        }
        res.status(500).json({ error: "Erro ao remover produto." })
    }
})

export default router