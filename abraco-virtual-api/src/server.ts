import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de status / boas-vindas
app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: 'API Abraço Virtual ativa e acolhendo vidas!' });
});

// Listar grupos de apoio com suporte a filtro por tipo (AA, NA, CVV)
app.get('/api/grupos-apoio', async (req: Request, res: Response) => {
  try {
    const { tipo } = req.query;
    const grupos = await prisma.grupoApoio.findMany({
      where: tipo ? { tipo: String(tipo).toUpperCase() } : undefined,
    });
    res.json(grupos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar grupos de apoio' });
  }
});

// Cadastrar um novo grupo de apoio
app.post('/api/grupos-apoio', async (req: Request, res: Response) => {
  try {
    const { nome, tipo, descricao, siteUrl, telefone } = req.body;
    if (!nome || !tipo || !descricao) {
      return res.status(400).json({ erro: 'Nome, tipo e descrição são obrigatórios' });
    }
    const novoGrupo = await prisma.grupoApoio.create({
      data: { nome, tipo: tipo.toUpperCase(), descricao, siteUrl, telefone }
    });
    res.status(201).json(novoGrupo);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar grupo de apoio' });
  }
});

// Linha de emergência rápida
app.get('/api/emergencia', (req: Request, res: Response) => {
  res.json([
    { nome: 'CVV - Centro de Valorização da Vida', telefone: '188', site: 'https://www.cvv.org.br/' },
    { nome: 'SAMU', telefone: '192', site: null },
    { nome: 'Alcoólicos Anônimos (AA)', telefone: '(11) 3315-9333', site: 'https://www.aa.org.br/' },
    { nome: 'Narcóticos Anônimos (NA)', telefone: '0800 888 6262', site: 'https://www.na.org.br/' }
  ]);
});

// Registrar humor do usuário
app.post('/api/humor', async (req: Request, res: Response) => {
  try {
    const { humor, comentario } = req.body;
    const registro = await prisma.registroHumor.create({
      data: { humor, comentario: comentario || '' }
    });
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao salvar registro de humor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

