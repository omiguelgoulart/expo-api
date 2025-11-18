import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const comandaSchema = z.object({
   numero: z.string().min(1, "Identificador é obrigatório!!"),
   data: z.string().optional(),
   status: z.enum(['ABERTA', 'FECHADA', 'CANCELADA', 'PENDENTE']).default('ABERTA').optional(),
   empresaId: z.string(),
   usuarioId: z.string().optional()
})
// rota get
router.get("/", async (req, res) => {
    try {
        const comandas = await prisma.comanda.findMany({
            include: { pedidos: { include: { produto: true } } }
        })
        res.json(comandas)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comandas." })
    }           
})

// rota post
router.post("/", async (req, res) => {
    try {
        const parsedData = comandaSchema.parse(req.body)
        // valida que 'numero' é uma string não vazia
        const comandaData = {
            ...parsedData,
            numero: parsedData.numero
        }
        if (!comandaData.numero || typeof comandaData.numero !== "string") {
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
router.patch("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const parsedData = comandaSchema.partial().parse(req.body)
        // opcional: checar existência antes
        const existe = await prisma.comanda.findUnique({ where: { id } })
        if (!existe) return res.status(404).json({ message: "Comanda não encontrada." })
        const comandaAtualizada = await prisma.comanda.update({
            where: { id },
            data: parsedData,
        })
        return res.json(comandaAtualizada)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors })
        }
        res.status(500).json({ error: "Erro ao atualizar comanda." })
    }
})

// rota delete
router.delete("/:id", async (req, res) => {
    const id = req.params.id
    try {
        await prisma.comanda.delete({
            where: { id }
        })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar comanda." })
    }
})

//get detalhes da comanda
router.get("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const comanda = await prisma.comanda.findUnique({
            where: { id },
            include: { pedidos: { include: { produto: true } } }
        })
        if (!comanda) {
            return res.status(404).json({ message: "Comanda não encontrada." })
        }
        res.json(comanda)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comanda." })
    }
})

export default router