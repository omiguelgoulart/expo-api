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
        const { categoriaId, preco, ...rest } = parsed

        const data: Prisma.ProdutoCreateInput = {
            ...rest,
            preco: new Prisma.Decimal(preco),    // ou simplesmente: preco, se gerado aceitar string
            categoria: { connect: { id: categoriaId } },
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

// rota put
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." })
    try {
        const parsedData = produtoSchema.partial().parse(req.body)
        const { categoriaId, preco, ...rest } = parsedData
        const data: Prisma.ProdutoUpdateInput = { ...rest }

        if (categoriaId !== undefined) {
            data.categoria = { connect: { id: categoriaId } }
        }
        if (preco !== undefined) {
            data.preco = new Prisma.Decimal(preco)  // ou simplesmente: preco, se gerado aceitar string
        }
        // opcional: checar existência antes
        const existe = await prisma.produto.findUnique({ where: { id } })
        if (!existe) return res.status(404).json({ message: "Produto não encontrado." })
        const produtoAtualizado = await prisma.produto.update({
            where: { id },
            data,
        })
        return res.json(produtoAtualizado)
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        return res.status(500).json({ message: "Erro ao atualizar produto.", error: String(error.message ?? error) })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        await prisma.produto.delete({
            where: { id: Number(id) }
        })
        res.status(204).send()
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao deletar produto." })
    }
})

export default router