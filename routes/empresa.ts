import { Prisma, PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const empresaSchema = z.object({
    nome: z.string().min(1),
    cnpj: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email().optional(),
})

// rota get
router.get("/", async (req, res) => {
    try {
        const empresas = await prisma.empresa.findMany()
        res.json(empresas)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar empresas." })
    }
})

// rota get por id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const empresa = await prisma.empresa.findUnique({
            where: { id: id }
        })
        if (!empresa) {
            return res.status(404).json({ message: "Empresa não encontrada." })
        }
        res.json(empresa)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar empresa." })
    }
})

// rota post
router.post("/", async (req, res) => {
    try {
        const parsed = empresaSchema.parse(req.body)
        const novoEmpresa = await prisma.empresa.create({ data: parsed })
        return res.status(201).json(novoEmpresa)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        return res.status(500).json({ message: "Erro ao criar empresa.", error: String((error as any)?.message ?? error) })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        await prisma.empresa.delete({
            where: { id: id }
        })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover empresa." })
    }
})

// rota patch
router.patch("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const parsed = empresaSchema.partial().parse(req.body)
        const empresaAtualizada = await prisma.empresa.update({
            where: { id: id },
            data: parsed
        })
        res.json(empresaAtualizada)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }   
        res.status(500).json({ error: "Erro ao atualizar empresa." })
    }
})

export default router