import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // -------------------------------
  // Empresa
  // -------------------------------
  const empresa = await prisma.empresa.create({
    data: {
      nome: "Restaurante Sabor Caseiro",
      cnpj: "12.345.678/0001-99",
      telefone: "(51) 99999-9999",
      email: "contato@saborcaseiro.com",
    },
  });

  console.log("✔ Empresa criada:", empresa.nome);

  // -------------------------------
  // Usuários
  // -------------------------------
  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@saborcaseiro.com",
      senha: "123456", // coloque hash futuramente
      papel: "ADMIN",
      empresaId: empresa.id,
    },
  });

  const garcom = await prisma.usuario.create({
    data: {
      nome: "Pedro Garçom",
      email: "garcom@saborcaseiro.com",
      senha: "123456",
      papel: "GARCOM",
      empresaId: empresa.id,
    },
  });

  const funcionario = await prisma.usuario.create({
    data: {
      nome: "Maria Funcionária",
      email: "func@saborcaseiro.com",
      senha: "123456",
      papel: "FUNCIONARIO",
      empresaId: empresa.id,
    },
  });

  console.log("✔ Usuários criados");

  // -------------------------------
  // Categorias
  // -------------------------------
  const categorias = await prisma.categoria.createMany({
    data: [
      { nome: "Bebidas", descricao: "Refrigerantes, sucos e água", empresaId: empresa.id },
      { nome: "Lanches", descricao: "Xis, hambúrguer e porções", empresaId: empresa.id },
      { nome: "Pratos", descricao: "Pratos executivos e refeições", empresaId: empresa.id },
    ],
  });

  console.log("✔ Categorias criadas");

  // Buscar categorias para vincular produtos
  const bebidas = await prisma.categoria.findFirst({ where: { nome: "Bebidas", empresaId: empresa.id } });
  const lanches = await prisma.categoria.findFirst({ where: { nome: "Lanches", empresaId: empresa.id } });
  const pratos  = await prisma.categoria.findFirst({ where: { nome: "Pratos", empresaId: empresa.id } });

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
        empresaId: empresa.id,
        categoriaId: bebidas!.id,
      },
      {
        nome: "Água Mineral",
        descricao: "500ml",
        preco: 4.00,
        estoque: 40,
        empresaId: empresa.id,
        categoriaId: bebidas!.id,
      },
      {
        nome: "Xis Salada",
        descricao: "Pão, carne, salada e molho",
        preco: 22.00,
        estoque: 20,
        empresaId: empresa.id,
        categoriaId: lanches!.id,
      },
      {
        nome: "Batata Frita",
        descricao: "Porção média",
        preco: 18.00,
        estoque: 15,
        empresaId: empresa.id,
        categoriaId: lanches!.id,
      },
      {
        nome: "Prato Feito",
        descricao: "Arroz, feijão, salada e carne",
        preco: 25.00,
        estoque: 30,
        empresaId: empresa.id,
        categoriaId: pratos!.id,
      },
      {
        nome: "Parmegiana",
        descricao: "Carne + molho + queijo + arroz + fritas",
        preco: 32.00,
        estoque: 18,
        empresaId: empresa.id,
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
