import { PrismaClient } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Router } from "express"
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const categoriaSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    descricao: z.string().optional(),
    empresaId: z.string().min(1, "empresaId é obrigatório")
})

// rota get
router.get("/", async (req, res) => {
    try {
        const categorias = await prisma.categoria.findMany()
        res.json(categorias)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar categorias." })
    }
})

// rota post
router.post("/", async (req, res) => {
    try {
        const parsedData = categoriaSchema.parse(req.body)
        const novaCategoria = await prisma.categoria.create({
            data: parsedData
        })
        res.status(201).json(novaCategoria)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors })
        }
        res.status(500).json({ error: "Erro ao criar categoria." })
    }
})

// rota patch
router.patch("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const parsedData = categoriaSchema.partial().parse(req.body)
        const categoriaAtualizada = await prisma.categoria.update({
            where: { id: Number(id) },
            data: parsedData
        })
        res.json(categoriaAtualizada)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors })
        }
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Categoria não encontrada." })
        }
        res.status(500).json({ error: "Erro ao atualizar categoria." })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
        const { id } = req.params
        try {
                await prisma.categoria.delete({
                        where: { id: Number(id) }
                })
                res.status(200).json({ message: "Categoria removida com sucesso." })
        } catch (error) {
                res.status(500).json({ error: "Erro ao deletar categoria." })
        }
})

export default router