import { PrismaClient, Prisma } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // 1. Criar usuário admin
  const senhaHash = await bcrypt.hash("123456", 10)
  await prisma.usuario.upsert({
    where: { email: "admin@restaurante.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@restaurante.com",
      senha: senhaHash,
    },
  })

  // 2. Criar categorias
  const bebidas = await prisma.categoria.upsert({
    where: { nome: "Bebidas" },
    update: {},
    create: { nome: "Bebidas", descricao: "Sucos, refrigerantes, drinks e cervejas" },
  })

  const pratos = await prisma.categoria.upsert({
    where: { nome: "Pratos" },
    update: {},
    create: { nome: "Pratos", descricao: "Refeições principais" },
  })

  const sobremesas = await prisma.categoria.upsert({
    where: { nome: "Sobremesas" },
    update: {},
    create: { nome: "Sobremesas", descricao: "Doces e sobremesas" },
  })

  // 3. Criar produtos
  const produtos = await prisma.produto.createMany({
    data: [
      // Bebidas
      {
        nome: "Coca-Cola Lata",
        descricao: "350ml",
        preco: new Prisma.Decimal("6.50"),
        estoque: 100,
        ativo: true,
        categoriaId: bebidas.id,
        tipo_item: "BEBIDA",
      },
      {
        nome: "Suco de Laranja",
        descricao: "Copo 300ml natural",
        preco: new Prisma.Decimal("8.00"),
        estoque: 50,
        ativo: true,
        categoriaId: bebidas.id,
        tipo_item: "BEBIDA",
      },
      {
        nome: "Cerveja Heineken",
        descricao: "Long neck 330ml",
        preco: new Prisma.Decimal("12.00"),
        estoque: 80,
        ativo: true,
        categoriaId: bebidas.id,
        tipo_item: "BEBIDA",
      },

      // Pratos
      {
        nome: "Filé à Parmegiana",
        descricao: "Serve 1 pessoa",
        preco: new Prisma.Decimal("42.90"),
        estoque: 20,
        ativo: true,
        categoriaId: pratos.id,
        tipo_item: "REFEICAO_FIXO",
      },
      {
        nome: "Strogonoff de Frango",
        descricao: "Acompanha arroz e batata palha",
        preco: new Prisma.Decimal("35.00"),
        estoque: 30,
        ativo: true,
        categoriaId: pratos.id,
        tipo_item: "REFEICAO_FIXO",
      },

      // Sobremesas
      {
        nome: "Pudim de Leite",
        descricao: "Fatias individuais",
        preco: new Prisma.Decimal("12.00"),
        estoque: 15,
        ativo: true,
        categoriaId: sobremesas.id,
        tipo_item: "SOBREMESA",
      },
      {
        nome: "Petit Gateau",
        descricao: "Bolo com sorvete de creme",
        preco: new Prisma.Decimal("18.00"),
        estoque: 10,
        ativo: true,
        categoriaId: sobremesas.id,
        tipo_item: "SOBREMESA",
      },
    ],
  })

  console.log(`✅ Produtos inseridos: ${produtos.count}`)

  // Buscar produtos criados para vincular
  const allProdutos = await prisma.produto.findMany()

  // 4. Criar comandas
  const comanda1 = await prisma.comanda.create({
    data: { numero: "201", status: "ABERTA" },
  })

  const comanda2 = await prisma.comanda.create({
    data: { numero: "202", status: "PENDENTE" },
  })

  const comanda3 = await prisma.comanda.create({
    data: { numero: "203", status: "FECHADA" },
  })

  const comanda4 = await prisma.comanda.create({
    data: { numero: "204", status: "CANCELADA" },
  })

  // 5. Criar itens em comandas
  await prisma.pedidoItem.createMany({
    data: [
      // Comanda 1 (aberta)
      {
        comandaId: comanda1.id,
        produtoId: allProdutos.find((p) => p.nome === "Coca-Cola Lata")!.id,
        quantidade: new Prisma.Decimal("2.00"),
        precoUnitario: new Prisma.Decimal("6.50"),
        subtotal: new Prisma.Decimal("13.00"),
        observacoes: "bem gelada",
      },
      {
        comandaId: comanda1.id,
        produtoId: allProdutos.find((p) => p.nome === "Filé à Parmegiana")!.id,
        quantidade: new Prisma.Decimal("1.00"),
        precoUnitario: new Prisma.Decimal("42.90"),
        subtotal: new Prisma.Decimal("42.90"),
        observacoes: "com arroz e fritas",
      },

      // Comanda 2 (pendente)
      {
        comandaId: comanda2.id,
        produtoId: allProdutos.find((p) => p.nome === "Suco de Laranja")!.id,
        quantidade: new Prisma.Decimal("1.00"),
        precoUnitario: new Prisma.Decimal("8.00"),
        subtotal: new Prisma.Decimal("8.00"),
        observacoes: "sem açúcar",
      },
      {
        comandaId: comanda2.id,
        produtoId: allProdutos.find((p) => p.nome === "Strogonoff de Frango")!.id,
        quantidade: new Prisma.Decimal("1.00"),
        precoUnitario: new Prisma.Decimal("35.00"),
        subtotal: new Prisma.Decimal("35.00"),
        observacoes: "com bastante batata palha",
      },

      // Comanda 3 (fechada)
      {
        comandaId: comanda3.id,
        produtoId: allProdutos.find((p) => p.nome === "Cerveja Heineken")!.id,
        quantidade: new Prisma.Decimal("3.00"),
        precoUnitario: new Prisma.Decimal("12.00"),
        subtotal: new Prisma.Decimal("36.00"),
        observacoes: "long neck",
      },
      {
        comandaId: comanda3.id,
        produtoId: allProdutos.find((p) => p.nome === "Pudim de Leite")!.id,
        quantidade: new Prisma.Decimal("2.00"),
        precoUnitario: new Prisma.Decimal("12.00"),
        subtotal: new Prisma.Decimal("24.00"),
        observacoes: "bem doce",
      },

      // Comanda 4 (cancelada)
      {
        comandaId: comanda4.id,
        produtoId: allProdutos.find((p) => p.nome === "Petit Gateau")!.id,
        quantidade: new Prisma.Decimal("1.00"),
        precoUnitario: new Prisma.Decimal("18.00"),
        subtotal: new Prisma.Decimal("18.00"),
        observacoes: "com sorvete extra",
      },
    ],
  })

  console.log("✅ Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
