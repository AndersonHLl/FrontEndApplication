import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { checkUserExists, createUser, loginUser, changePassword } from '../utils/supabase/client';
import { testBasicConnection, testSimpleUserCheck, testSimpleUserCreate, testSimpleUserLogin } from '../utils/supabase/client-test';

interface LoginRegisterProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export function LoginRegister({ onLogin }: LoginRegisterProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await loginUser(loginData.email, loginData.password);
      if (user) {
        onLogin({ name: user.name, email: user.email });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : String(error) || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) return;

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await createUser({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      });

      if (user) {
        setSuccess('Usuario creado exitosamente. Puede iniciar sesión ahora.');
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Register error:', error);
      setError(error instanceof Error ? error.message : String(error) || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailVerified) {
      if (!forgotPasswordData.email) {
        setError('Por favor ingrese su correo electrónico');
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const user = await checkUserExists(forgotPasswordData.email);
        if (user) {
          setEmailVerified(true);
          setSuccess('Correo verificado. Ahora puede establecer una nueva contraseña.');
        } else {
          setError('El correo electrónico no está registrado en nuestro sistema.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setError('Error al verificar el correo electrónico');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
        setError('Por favor complete todos los campos');
        return;
      }

      if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (forgotPasswordData.newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const success = await changePassword(forgotPasswordData.email, forgotPasswordData.newPassword);
        if (success) {
          setSuccess('Contraseña cambiada exitosamente. Puede iniciar sesión con su nueva contraseña.');
          setShowForgotPassword(false);
          setEmailVerified(false);
          setForgotPasswordData({ email: '', newPassword: '', confirmPassword: '' });
        }
      } catch (error) {
        console.error('Password change error:', error);
        setError(error instanceof Error ? error.message : String(error) || 'Error al cambiar la contraseña');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-primary mb-2">MiVivienda BBP</h1>
          <p className="text-muted-foreground">Simulación de Crédito con Bono Buen Pagador</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{showForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}</CardTitle>
                <CardDescription>
                  {showForgotPassword 
                    ? 'Ingresa tu correo para verificar tu cuenta y cambiar tu contraseña'
                    : 'Ingresa tu correo electrónico y contraseña para acceder a la plataforma'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {!showForgotPassword ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          disabled={isLoading}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setError('');
                          setSuccess('');
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </div>

                    
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Correo electrónico</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                        disabled={isLoading || emailVerified}
                        required
                      />
                    </div>

                    {emailVerified && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nueva contraseña</Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Nueva contraseña (mínimo 6 caracteres)"
                            value={forgotPasswordData.newPassword}
                            onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                            disabled={isLoading}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
                          <Input
                            id="confirm-new-password"
                            type="password"
                            placeholder="Confirmar nueva contraseña"
                            value={forgotPasswordData.confirmPassword}
                            onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmPassword: e.target.value })}
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {emailVerified ? 'Cambiando contraseña...' : 'Verificando...'}
                        </>
                      ) : (
                        emailVerified ? 'Cambiar contraseña' : 'Verificar correo'
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setEmailVerified(false);
                          setForgotPasswordData({ email: '', newPassword: '', confirmPassword: '' });
                          setError('');
                          setSuccess('');
                        }}
                      >
                        Volver al login
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>
                  Completa el formulario para crear tu cuenta. Tu contraseña debe tener al menos 6 caracteres.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Contraseña (mínimo 6 caracteres)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmar contraseña"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}