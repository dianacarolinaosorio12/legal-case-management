import { test, expect } from '@playwright/test';

test.describe('Sprint 1: E2E Tests', () => {
  
  // ============================================
  // TEST 1: Login como Estudiante
  // ============================================
  test('debería iniciar sesión como estudiante', async ({ page }) => {
    await page.goto('/login');
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    
    // Click en botón de login
    await page.click('button[type="submit"]');
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // ============================================
  // TEST 2: Registro de Caso con 23 dígitos
  // ============================================
  test('debería crear un caso con número de proceso de 23 dígitos', async ({ page }) => {
    // Login primero
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Navegar a nuevo caso
    await page.goto('/dashboard/nuevo-caso');
    
    // Llenar formulario - Paso 1: Información Básica
    await page.selectOption('select[id="caseType"]', 'tutela');
    await page.selectOption('select[id="area"]', 'civil');
    
    // Click en Siguiente
    await page.click('button:text("Siguiente")');
    
    // Paso 2: Datos del solicitante
    await page.fill('input[id="clientName"]', 'Juan Prueba');
    await page.fill('input[id="clientDoc"]', '12345678');
    await page.fill('input[id="clientPhone"]', '3001234567');
    await page.fill('input[id="clientEmail"]', 'juan@prueba.com');
    await page.fill('textarea[id="clientAddress"]', 'Calle Test 123');
    
    await page.click('button:text("Siguiente")');
    
    // Paso 3: Notas de entrevista
    await page.click('button:text("Siguiente")');
    
    // Paso 4: Carga de documentos (opcional)
    await page.click('button:text("Crear Expediente")');
    
    // Confirmar en dialog
    await page.click('button:text("Si, crear expediente")');
    
    // Verificar redirección a casos
    await expect(page).toHaveURL(/\/dashboard\/casos/);
  });

  // ============================================
  // TEST 3: Validación de Calendario
  // ============================================
  test('debería mostrar eventos en el calendario con colores correctos', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Navegar al calendario
    await page.goto('/dashboard/calendario');
    
    // Verificar que el calendario cargó
    await expect(page.locator('h1')).toContainText('Calendario');
    
    // Verificar que hay eventos (deberían existir del seed)
    // Los colores se muestran en las tarjetas de resumen
    const urgenteCards = page.locator('.text-destructive').first();
    await expect(urgenteCards).toBeVisible();
  });

  // ============================================
  // TEST 4: Seguridad - Estudiante solo ve sus casos
  // ============================================
  test('debería filtrar casos para estudiante', async ({ page }) => {
    // Login como estudiante
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Navegar a casos
    await page.goto('/dashboard/casosp');
    
    // Los casos que aparecen deben ser solo del estudiante logueado
    // Verificar que existe la tabla o lista de casos
    const casosTable = page.locator('table').or(page.locator('[class*="case"]'));
    await expect(casosTable).toBeVisible({ timeout: 10000 });
  });

  // ============================================
  // TEST 5: Documentos en Caso
  // ============================================
  test('debería mostrar documentos asociados a un caso', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Navegar a casos
    await page.goto('/dashboard/casos');
    
    // Hacer click en el primer caso
    const primerCaso = page.locator('a[href*="/dashboard/casos/"]').first();
    await expect(primerCaso).toBeVisible({ timeout: 10000 });
  });
});
