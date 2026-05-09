import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Resume Generator - Unit & Integration Tests', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('deve renderizar a primeira etapa (Dados Pessoais) por padrão', () => {
    render(<App />)
    expect(screen.getByText(/Dados Pessoais/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Maria Carolina Silva/i)).toBeInTheDocument()
  })

  it('deve mostrar erros de validação ao tentar avançar sem preencher campos obrigatórios', async () => {
    render(<App />)
    const btnProximo = screen.getByText(/Próximo/i)
    
    fireEvent.click(btnProximo)

    expect(await screen.findByText(/Nome é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument()
    expect(screen.getByText(/Telefone é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/Cidade é obrigatória/i)).toBeInTheDocument()
  })

  it('deve permitir avançar para a Etapa 2 após preenchimento correto', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText(/Maria Carolina Silva/i), 'Carlos Alberto')
    await user.type(screen.getByPlaceholderText(/maria@email.com/i), 'carlos@teste.com')
    await user.type(screen.getByPlaceholderText(/\(11\) 90000-0000/i), '11988887777')
    await user.type(screen.getByPlaceholderText(/São Paulo, SP/i), 'Curitiba, PR')

    await user.click(screen.getByText(/Próximo/i))

    expect(await screen.findByText(/Resumo Profissional/i)).toBeInTheDocument()
  })

  it('deve adicionar e remover formações acadêmicas corretamente', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Pula para etapa 3 (Formação) manipulando o estado via clicks (simulando fluxo real)
    await user.type(screen.getByPlaceholderText(/Maria Carolina Silva/i), 'Carlos Alberto')
    await user.type(screen.getByPlaceholderText(/maria@email.com/i), 'carlos@teste.com')
    await user.type(screen.getByPlaceholderText(/\(11\) 90000-0000/i), '11988887777')
    await user.type(screen.getByPlaceholderText(/São Paulo, SP/i), 'Curitiba, PR')
    await user.click(screen.getByText(/Próximo/i))
    
    await user.type(screen.getByPlaceholderText(/Ex: Desenvolvedor Senior/i), 'Desenvolvedor focado em testes com vasta experiência em automação.'.repeat(2))
    await user.click(screen.getByText(/Próximo/i))

    expect(await screen.findByText(/Histórico Acadêmico/i)).toBeInTheDocument()

    // Adiciona nova formação
    const btnAdd = screen.getByText(/Adicionar Outra Formação/i)
    await user.click(btnAdd)

    const inputsCurso = screen.getAllByPlaceholderText(/Ex: Engenharia de Software/i)
    expect(inputsCurso).toHaveLength(2)

    // Remove a segunda formação
    const btnRemover = screen.getAllByRole('button').find(b => b.querySelector('svg')) // Localiza o botão com ícone Trash
    // Como o App.jsx usa ícones Lucide, o botão de remover tem a classe text-red-500 ou similar
    const deleteButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('svg'))
    // Na verdade, no App.jsx usamos um botão com Trash2
    
    // Vamos testar o comportamento de clique no botão de remover (o primeiro que aparecer)
    // No estado inicial tem 1. Clicou em adicionar, tem 2.
    const removeButtons = screen.getAllByRole('button').filter(b => b.className.includes('text-slate-400'))
    await user.click(removeButtons[0])

    expect(screen.getAllByPlaceholderText(/Ex: Engenharia de Software/i)).toHaveLength(1)
  })

  it('deve salvar o progresso no localStorage ao preencher dados', async () => {
    const user = userEvent.setup()
    render(<App />)

    const inputNome = screen.getByPlaceholderText(/Maria Carolina Silva/i)
    await user.type(inputNome, 'Teste LocalStorage')

    expect(window.localStorage.setItem).toHaveBeenCalled()
    const callData = JSON.parse(vi.mocked(window.localStorage.setItem).mock.calls[0][1])
    expect(callData.pessoal.nome).toBe('Teste LocalStorage')
  })
})
