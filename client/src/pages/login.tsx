import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { StickyNote, Eye, EyeOff } from "lucide-react";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginUser } from "@shared/schema";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha inválidos",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
      <div className="bg-white rounded-lg material-shadow-lg p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <StickyNote className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Anotações Mensais</h1>
          <p className="text-gray-600">Faça login para acessar suas tarefas</p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FloatingLabelInput
            id="login-email"
            label="Email"
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
          
          <div className="relative">
            <FloatingLabelInput
              id="login-password"
              label="Senha"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium"
            style={{ backgroundColor: '#28a745' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#218838'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#28a745'}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <button
              onClick={() => setLocation("/register")}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
