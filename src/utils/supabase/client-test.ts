import { projectId, publicAnonKey } from './info';

// Versión simplificada para testing
export async function testBasicConnection(): Promise<any> {
  try {
    console.log('Testing basic connection...');
    console.log('Project ID:', projectId);
    console.log('Public Key available:', publicAnonKey ? 'Yes' : 'No');
    
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/health`;
    console.log('Testing URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
}

// Test simple de usuario sin KV store
export async function testSimpleUserCheck(email: string): Promise<any> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/check-user`;
    console.log('Testing user check URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email }),
    });

    console.log('User check response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('User check response:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('User check error:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('User check failed:', error);
    return { success: false, error: error.message };
  }
}

// Test simple de creación de usuario
export async function testSimpleUserCreate(userData: { email: string; name: string; password: string }): Promise<any> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/create-user`;
    console.log('Testing user create URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(userData),
    });

    console.log('User create response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('User create response:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('User create error:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('User create failed:', error);
    return { success: false, error: error.message };
  }
}

// Test simple de login
export async function testSimpleUserLogin(email: string, password: string): Promise<any> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-4bc2b4cc/login`;
    console.log('Testing user login URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('User login response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('User login response:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('User login error:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('User login failed:', error);
    return { success: false, error: error.message };
  }
}