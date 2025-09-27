import { PrismaClient } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Router } from "express"
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const categoriaSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    descricao: z.string().optional()
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
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." })

    try {
        const parsedData = categoriaSchema.partial().parse(req.body)

        // opcional: checar existência antes
        const existe = await prisma.categoria.findUnique({ where: { id } })
        if (!existe) return res.status(404).json({ message: "Categoria não encontrada." })

        const categoriaAtualizada = await prisma.categoria.update({
            where: { id },
            data: parsedData,
        })
        return res.json(categoriaAtualizada)

    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        // trata P2025 caso pule o findUnique
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            return res.status(404).json({ message: "Categoria não encontrada." })
        }
        return res.status(500).json({ message: "Erro ao atualizar categoria.", error: String(error.message ?? error) })
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

// rota delete
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        await prisma.categoria.delete({
            where: { id: Number(id) }
        })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar categoria." })
    }
})

export default router