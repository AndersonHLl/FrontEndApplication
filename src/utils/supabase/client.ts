import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Función para probar la conectividad del servidor
export async function testServerConnection(): Promise<boolean> {
  try {
    console.log('Testing server connection...');
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    console.log('Health check response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Health check response:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('Health check failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Server connection test failed:', error);
    return false;
  }
}

// Tipos para la base de datos
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type SavedSimulation = {
  id: string;
  user_email: string;
  name: string;
  simulation_data: any;
  results: any;
  created_at: string;
  is_base_scenario: boolean;
};

// Función para verificar si un usuario existe
export async function checkUserExists(email: string): Promise<User | null> {
  try {
    console.log('Checking user exists for:', email);
    console.log('Request URL:', `https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/check-user`);
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/check-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server responded with error:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Server response:', data);
    return data.user || null;
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
}

// Función para crear un nuevo usuario
export async function createUser(userData: { email: string; name: string; password: string }): Promise<User | null> {
  try {
    console.log('Creating user:', { email: userData.email, name: userData.name });
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(userData),
    });

    console.log('Create user response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server responded with error:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Create user response:', data);
    return data.user || null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Función para login con email y contraseña
export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    console.log('Login attempt for:', email);
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed:', errorData);
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Login successful');
    return data.user || null;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

// Función para cambiar contraseña
export async function changePassword(email: string, newPassword: string): Promise<boolean> {
  try {
    console.log('Changing password for:', email);
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, newPassword }),
    });

    console.log('Change password response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Change password failed:', errorData);
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Password changed successfully');
    return data.success;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// Función para guardar una simulación
export async function saveSimulation(simulationData: {
  user_email: string;
  name: string;
  simulation_data: any;
  results: any;
  is_base_scenario?: boolean;
}): Promise<SavedSimulation | null> {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/save-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(simulationData),
    });

    if (!response.ok) {
      throw new Error('Error guardando simulación');
    }

    const data = await response.json();
    return data.simulation || null;
  } catch (error) {
    console.error('Error saving simulation:', error);
    return null;
  }
}

// Función para obtener simulaciones de un usuario
export async function getUserSimulations(userEmail: string): Promise<SavedSimulation[]> {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/get-simulations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ user_email: userEmail }),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo simulaciones');
    }

    const data = await response.json();
    return data.simulations || [];
  } catch (error) {
    console.error('Error getting simulations:', error);
    return [];
  }
}

// Función para eliminar una simulación
export async function deleteSimulation(simulationId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/delete-simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ simulation_id: simulationId }),
    });

    if (!response.ok) {
      throw new Error('Error eliminando simulación');
    }

    return true;
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return false;
  }
}