import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserPlus } from "lucide-react";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";

const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo às Anotações Mensais.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
      <div className="bg-white rounded-lg material-shadow-lg p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Cadastre-se para começar a usar</p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FloatingLabelInput
              id="register-name"
              label="Nome Completo"
              type="text"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div>
            <FloatingLabelInput
              id="register-email"
              label="Email"
              type="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <FloatingLabelInput
              id="register-password"
              label="Senha (mín. 6 caracteres)"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          
          <div>
            <FloatingLabelInput
              id="register-confirm-password"
              label="Confirmar Senha"
              type="password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium"
            style={{ backgroundColor: '#28a745' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#218838'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#28a745'}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
