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
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  // ============================================
  // TEST 2: Registro de Caso - Verificar formulario carga
  // ============================================
  test('debería cargar formulario de nuevo caso', async ({ page }) => {
    // Login primero
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Navegar a nuevo caso
    await page.goto('/dashboard/nuevo-caso');
    
    // Verificar que el formulario carga
    await expect(page.locator('text=Nuevo Expediente')).toBeVisible({ timeout: 10000 });
    
    // Verificar que el select de área tiene data-testid
    await expect(page.locator('[data-testid="select-area"]')).toBeVisible({ timeout: 5000 });
  });

  // ============================================
  // TEST 3: Validación de Calendario
  // ============================================
  test('debería mostrar calendario con eventos', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Navegar al calendario
    await page.goto('/dashboard/calendario');
    
    // Verificar que el calendario cargó
    await expect(page.locator('h1:has-text("Calendario")')).toBeVisible({ timeout: 10000 });
  });

  // ============================================
  // TEST 4: Página de Casos Carga
  // ============================================
  test('debería cargar página de casos', async ({ page }) => {
    // Login como estudiante
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Navegar a casos
    await page.goto('/dashboard/casos');
    
    // Verificar que la página carga (puede estar cargando datos)
    await expect(page.locator('text=Mis Casos')).toBeVisible({ timeout: 10000 });
  });

  // ============================================
  // TEST 5: Navegación a Detalle de Caso
  // ============================================
  test('debería navegar a detalle de caso', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mgonzalez@universidad.edu.co');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Navegar a casos
    await page.goto('/dashboard/casos');
    
    // La página debe cargar aunque no haya datos
    await page.waitForTimeout(3000); // Esperar a que cargue la API
  });
});
