import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo do Gerador de Currículo', () => {
  test('deve preencher todas as etapas e chegar ao preview', async ({ page }) => {
    // Acessa a aplicação
    await page.goto('http://localhost:5173');

    // ETAPA 1: Dados Pessoais
    await page.fill('placeholder=Ex: Maria Carolina Silva', 'Dev de Testes');
    await page.fill('placeholder=maria@email.com', 'test@example.com');
    await page.fill('placeholder=(11) 90000-0000', '11999999999');
    await page.fill('placeholder=São Paulo, SP', 'Rio de Janeiro, RJ');
    await page.click('text=Salvar e Continuar');

    // ETAPA 2: Objetivo
    await page.fill('textarea', 'Sou um desenvolvedor especialista em automação de testes com Playwright e Vitest. Busco oportunidades desafiadoras.');
    await page.click('text=Salvar e Continuar');

    // ETAPA 3: Formação
    await page.fill('placeholder=Ex: Engenharia de Software', 'Engenharia da Qualidade');
    await page.fill('placeholder=Ex: Universidade Federal', 'Universidade de Testes');
    await page.fill('placeholder=Ex: 2018', '2020');
    await page.click('text=Salvar e Continuar');

    // ETAPA 4: Experiência
    await page.fill('placeholder=Ex: Tech Corp SA', 'QA Company');
    await page.fill('placeholder=Ex: Desenvolvedor Senior', 'Analista de QA Pleno');
    await page.fill('placeholder=Ex: Mar/2021', 'Jan/2022');
    await page.fill('textarea', 'Responsável pela criação de suítes de testes automatizados e integração contínua.');
    await page.click('text=Salvar e Continuar');

    // ETAPA 5: Habilidades
    await page.fill('placeholder=Ex: Gestão de Projetos', 'JavaScript');
    await page.keyboard.press('Enter');
    await page.fill('placeholder=Ex: Gestão de Projetos', 'Playwright');
    await page.keyboard.press('Enter');
    await page.fill('placeholder=Ex: Gestão de Projetos', 'React');
    await page.keyboard.press('Enter');
    
    await page.click('text=Gerar Currículo Mágico');

    // TELA DE PREVIEW
    await expect(page.locator('text=Design do PDF:')).toBeVisible();
    await expect(page.locator('text=Baixar PDF')).toBeEnabled();
    
    // Verifica se o nome aparece no preview
    await expect(page.locator('text=Dev de Testes')).toBeVisible();
  });
});
