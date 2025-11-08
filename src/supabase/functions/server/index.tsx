import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Debug logging
console.log("Server starting up...");
console.log("SUPABASE_URL:", Deno.env.get("SUPABASE_URL") ? "Set" : "Not set");
console.log("SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "Set" : "Not set");

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4bc2b4cc/health", (c) => {
  console.log("Health check requested");
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: Deno.env.get("SUPABASE_URL") ? "Set" : "Not set",
      service_role_key: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "Set" : "Not set"
    }
  });
});

// Check if user exists (for forgot password)
app.post("/make-server-4bc2b4cc/check-user", async (c) => {
  try {
    console.log("Check user request received");
    const { email } = await c.req.json();
    console.log("Checking email:", email);
    
    if (!email) {
      console.log("No email provided");
      return c.json({ error: "Email requerido" }, 400);
    }

    const user = await kv.get(`user:${email}`);
    console.log("User found:", user ? "Yes" : "No");
    
    if (user) {
      // Return user without password hash
      const { password_hash, ...userResponse } = user;
      return c.json({ user: userResponse });
    }
    
    return c.json({ user: null });
  } catch (error) {
    console.error("Error checking user:", error);
    return c.json({ error: `Error verificando usuario: ${error.message}` }, 500);
  }
});

// Login with email and password
app.post("/make-server-4bc2b4cc/login", async (c) => {
  try {
    console.log("Login request received");
    const { email, password } = await c.req.json();
    console.log("Login attempt for email:", email);
    
    if (!email || !password) {
      return c.json({ error: "Email y contraseña son requeridos" }, 400);
    }

    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }

    // Hash the provided password and compare
    const hashedPassword = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'salt'));
    const passwordHash = Array.from(new Uint8Array(hashedPassword)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (user.password_hash !== passwordHash) {
      return c.json({ error: "Contraseña incorrecta" }, 401);
    }

    // Return user without password hash
    const { password_hash, ...userResponse } = user;
    console.log("Login successful for:", email);
    return c.json({ user: userResponse });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ error: `Error en el login: ${error.message}` }, 500);
  }
});

// Change password
app.post("/make-server-4bc2b4cc/change-password", async (c) => {
  try {
    console.log("Change password request received");
    const { email, newPassword } = await c.req.json();
    
    if (!email || !newPassword) {
      return c.json({ error: "Email y nueva contraseña son requeridos" }, 400);
    }

    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }

    // Hash the new password
    const hashedPassword = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newPassword + 'salt'));
    const passwordHash = Array.from(new Uint8Array(hashedPassword)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Update user with new password
    const updatedUser = {
      ...user,
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, updatedUser);
    
    console.log("Password changed successfully for:", email);
    return c.json({ success: true, message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error("Error changing password:", error);
    return c.json({ error: `Error cambiando contraseña: ${error.message}` }, 500);
  }
});

// Create new user
app.post("/make-server-4bc2b4cc/create-user", async (c) => {
  try {
    const { email, name, password } = await c.req.json();
    
    if (!email || !name || !password) {
      return c.json({ error: "Email, nombre y contraseña son requeridos" }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: "El usuario ya existe" }, 409);
    }

    // Simple password hashing (in production, use bcrypt)
    const hashedPassword = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'salt'));
    const passwordHash = Array.from(new Uint8Array(hashedPassword)).map(b => b.toString(16).padStart(2, '0')).join('');

    const user = {
      id: crypto.randomUUID(),
      email,
      name,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, user);
    
    // Return user without password hash
    const { password_hash, ...userResponse } = user;
    return c.json({ user: userResponse });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Error creando usuario" }, 500);
  }
});

// Save simulation
app.post("/make-server-4bc2b4cc/save-simulation", async (c) => {
  try {
    const { user_email, name, simulation_data, results, is_base_scenario } = await c.req.json();
    
    if (!user_email || !name || !simulation_data || !results) {
      return c.json({ error: "Datos de simulación incompletos" }, 400);
    }

    // Verify user exists
    const user = await kv.get(`user:${user_email}`);
    if (!user) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }

    const simulation = {
      id: crypto.randomUUID(),
      user_email,
      name,
      simulation_data,
      results,
      is_base_scenario: is_base_scenario || false,
      created_at: new Date().toISOString(),
    };

    await kv.set(`simulation:${simulation.id}`, simulation);
    
    // Add to user's simulation list
    const userSimulationsKey = `user_simulations:${user_email}`;
    const userSimulations = await kv.get(userSimulationsKey) || [];
    userSimulations.push(simulation.id);
    await kv.set(userSimulationsKey, userSimulations);
    
    return c.json({ simulation });
  } catch (error) {
    console.error("Error saving simulation:", error);
    return c.json({ error: "Error guardando simulación" }, 500);
  }
});

// Get user simulations
app.post("/make-server-4bc2b4cc/get-simulations", async (c) => {
  try {
    const { user_email } = await c.req.json();
    
    if (!user_email) {
      return c.json({ error: "Email de usuario requerido" }, 400);
    }

    const userSimulationsKey = `user_simulations:${user_email}`;
    const simulationIds = await kv.get(userSimulationsKey) || [];
    
    const simulations = [];
    for (const id of simulationIds) {
      const simulation = await kv.get(`simulation:${id}`);
      if (simulation) {
        simulations.push(simulation);
      }
    }
    
    // Sort by creation date (newest first)
    simulations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return c.json({ simulations });
  } catch (error) {
    console.error("Error getting simulations:", error);
    return c.json({ error: "Error obteniendo simulaciones" }, 500);
  }
});

// Delete simulation
app.post("/make-server-4bc2b4cc/delete-simulation", async (c) => {
  try {
    const { simulation_id } = await c.req.json();
    
    if (!simulation_id) {
      return c.json({ error: "ID de simulación requerido" }, 400);
    }

    const simulation = await kv.get(`simulation:${simulation_id}`);
    if (!simulation) {
      return c.json({ error: "Simulación no encontrada" }, 404);
    }

    // Remove from KV store
    await kv.del(`simulation:${simulation_id}`);
    
    // Remove from user's simulation list
    const userSimulationsKey = `user_simulations:${simulation.user_email}`;
    const userSimulations = await kv.get(userSimulationsKey) || [];
    const updatedSimulations = userSimulations.filter(id => id !== simulation_id);
    await kv.set(userSimulationsKey, updatedSimulations);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting simulation:", error);
    return c.json({ error: "Error eliminando simulación" }, 500);
  }
});

// Endpoint para inicializar usuarios de prueba
app.post("/make-server-4bc2b4cc/init-test-data", async (c) => {
  try {
    console.log("Initializing test data...");
    
    // Hash the test password
    const testPassword = "123456";
    const hashedPassword = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testPassword + 'salt'));
    const passwordHash = Array.from(new Uint8Array(hashedPassword)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Crear un usuario de prueba
    const testUser = {
      id: crypto.randomUUID(),
      email: "test@test.com",
      name: "Usuario de Prueba",
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${testUser.email}`, testUser);
    console.log("Test user created:", testUser.email);
    
    return c.json({ 
      success: true, 
      message: "Test data initialized",
      testUser: { id: testUser.id, email: testUser.email, name: testUser.name },
      testPassword: testPassword
    });
  } catch (error) {
    console.error("Error initializing test data:", error);
    return c.json({ error: `Error inicializando datos de prueba: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);