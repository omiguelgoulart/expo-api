import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // -------------------------------
  // Usuários
  // -------------------------------
  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@saborcaseiro.com",
      senha: "123456", // coloque hash futuramente
      papel: "ADMIN",
    },
  });

  const garcom = await prisma.usuario.create({
    data: {
      nome: "Pedro Garçom",
      email: "garcom@saborcaseiro.com",
      senha: "123456",
      papel: "GARCOM",
    },
  });

  const funcionario = await prisma.usuario.create({
    data: {
      nome: "Maria Funcionária",
      email: "func@saborcaseiro.com",
      senha: "123456",
      papel: "FUNCIONARIO",
    },
  });

  console.log("✔ Usuários criados");

  // -------------------------------
  // Categorias
  // -------------------------------
  await prisma.categoria.createMany({
    data: [
      { nome: "Bebidas", descricao: "Refrigerantes, sucos e água" },
      { nome: "Lanches", descricao: "Xis, hambúrguer e porções" },
      { nome: "Pratos", descricao: "Pratos executivos e refeições" },
    ],
  });

  console.log("✔ Categorias criadas");

  // Buscar categorias para vincular produtos
  const bebidas = await prisma.categoria.findFirst({ where: { nome: "Bebidas" } });
  const lanches = await prisma.categoria.findFirst({ where: { nome: "Lanches" } });
  const pratos  = await prisma.categoria.findFirst({ where: { nome: "Pratos" } });

  // -------------------------------
  // Produtos
  // -------------------------------
  await prisma.produto.createMany({
    data: [
      {
        nome: "Refrigerante Lata",
        descricao: "350ml",
        preco: 6.00,
        estoque: 50,
        categoriaId: bebidas!.id,
      },
      {
        nome: "Água Mineral",
        descricao: "500ml",
        preco: 4.00,
        estoque: 40,
        categoriaId: bebidas!.id,
      },
      {
        nome: "Xis Salada",
        descricao: "Pão, carne, salada e molho",
        preco: 22.00,
        estoque: 20,
        categoriaId: lanches!.id,
      },
      {
        nome: "Batata Frita",
        descricao: "Porção média",
        preco: 18.00,
        estoque: 15,
        categoriaId: lanches!.id,
      },
      {
        nome: "Prato Feito",
        descricao: "Arroz, feijão, salada e carne",
        preco: 25.00,
        estoque: 30,
        categoriaId: pratos!.id,
      },
      {
        nome: "Parmegiana",
        descricao: "Carne + molho + queijo + arroz + fritas",
        preco: 32.00,
        estoque: 18,
        categoriaId: pratos!.id,
      },
    ],
  });

  console.log("✔ Produtos criados");

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
