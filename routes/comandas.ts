import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const comandaSchema = z.object({
   numero: z.string().min(1, "Número é obrigatório"),
   data: z.string().optional(),
   status: z.enum(['ABERTA', 'FECHADA', 'CANCELADA', 'PENDENTE']).default('ABERTA'),
})
// rota get
router.get("/", async (req, res) => {
    try {
        const comandas = await prisma.comanda.findMany()
        res.json(comandas)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comandas." })
    }           
})

// rota post
router.post("/", async (req, res) => {
    try {
        const parsedData = comandaSchema.parse(req.body)
        // converte 'numero' para number
        const comandaData = {
            ...parsedData,
            numero: Number(parsedData.numero)
        }
        if (Number.isNaN(comandaData.numero)) {
            return res.status(400).json({ message: "Número inválido." })
        }
        const novaComanda = await prisma.comanda.create({
            data: comandaData
        })
        res.status(201).json(novaComanda)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors })
        }   
        res.status(500).json({ error: "Erro ao criar comanda." })
    }
})

// rota patch
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." })  
    try {
        const parsedData = comandaSchema.partial().parse(req.body)
        // opcional: checar existência antes
        const existe = await prisma.comanda.findUnique({ where: { id } })
        if (!existe) return res.status(404).json({ message: "Comanda não encontrada." })
        // converte 'numero' para number se existir
        const updateData: any = { ...parsedData }
        if (updateData.numero !== undefined) {
            updateData.numero = Number(updateData.numero)
            if (Number.isNaN(updateData.numero)) {
                return res.status(400).json({ message: "Número inválido." })
            }
        }
        const comandaAtualizada = await prisma.comanda.update({
            where: { id },
            data: updateData,
        })
        return res.json(comandaAtualizada)  
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.errors })
        }
        res.status(500).json({ error: "Erro ao atualizar comanda." })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." })
    try {
        // opcional: checar existência antes
        const existe = await prisma.comanda.findUnique({ where: { id } })
        if (!existe) return res.status(404).json({ message: "Comanda não encontrada." })
        await prisma.comanda.delete({ where: { id } })
        return res.status(200).json({ message: "Comanda deletada com sucesso." })
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar comanda." })
    }
})

//get detalhes da comanda
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido." })
    try {
        const comanda = await prisma.comanda.findUnique({
            where: { id },  
            include: { pedidos: { include: { produto: true } } }
        })
        if (!comanda) return res.status(404).json({ message: "Comanda não encontrada." })
        return res.json(comanda)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comanda." })
    }
})

export default router