import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  StickyNote, 
  Plus, 
  List, 
  LogOut, 
  CalendarPlus, 
  CalendarCheck, 
  Edit, 
  Trash2,
  PlusCircle,
  CheckCircle
} from "lucide-react";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertNoteSchema, type InsertNote, type Note, type User } from "@shared/schema";

type FilterType = "all" | "todo" | "completed";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const form = useForm<InsertNote>({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      title: "",
      createdDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().split('T')[0],
      status: "A Fazer",
    },
  });

  // Get current user
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Get notes
  const { data: notes = [], isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    enabled: !!userResponse,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      setLocation("/login");
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: InsertNote) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: () => {
      form.reset({
        title: "",
        createdDate: new Date().toISOString().split('T')[0],
        completedDate: new Date().toISOString().split('T')[0],
        status: "A Fazer",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Anotação criada!",
        description: "Sua anotação foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar anotação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertNote> }) => {
      const response = await apiRequest("PUT", `/api/notes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setEditingNote(null);
      toast({
        title: "Anotação atualizada!",
        description: "Sua anotação foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar anotação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Anotação excluída!",
        description: "Sua anotação foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir anotação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: async (id: number) => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiRequest("PUT", `/api/notes/${id}`, {
        status: "Concluída",
        completedDate: today
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Tarefa concluída!",
        description: "A tarefa foi marcada como concluída.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao marcar como concluída",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertNote) => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data });
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    form.reset({
      title: note.title,
      createdDate: note.createdDate,
      completedDate: note.completedDate || new Date().toISOString().split('T')[0],
      status: note.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    form.reset({
      title: "",
      createdDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().split('T')[0],
      status: "A Fazer",
    });
  };

  const filteredNotes = notes.filter((note) => {
    if (filter === "todo") return note.status === "A Fazer";
    if (filter === "completed") return note.status === "Concluída";
    return true;
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !userResponse) {
      setLocation("/login");
    }
  }, [userResponse, userLoading, setLocation]);

  if (userLoading) {
    return <div className="min-h-screen bg-surface-100 flex items-center justify-center">
      <div className="text-lg">Carregando...</div>
    </div>;
  }

  if (!userResponse || typeof userResponse !== 'object' || !('user' in userResponse)) {
    return null;
  }

  const user: User = userResponse.user as User;

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Header */}
      <header className="bg-white material-shadow border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <StickyNote className="w-8 h-8 text-primary-500" />
              <h1 className="text-xl font-medium text-gray-900">Anotações Mensais</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button 
                onClick={() => logoutMutation.mutate()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Note Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg material-shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <PlusCircle className="w-5 h-5 text-primary-500 mr-2" />
                {editingNote ? "Editar Anotação" : "Nova Anotação"}
              </h2>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <FloatingLabelInput
                    id="note-title"
                    label="Nome da Tarefa"
                    type="text"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <FloatingLabelInput
                    id="note-created-date"
                    label="Data da Anotação"
                    type="date"
                    {...form.register("createdDate")}
                  />
                  {form.formState.errors.createdDate && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.createdDate.message}</p>
                  )}
                </div>
                
                <div>
                  <FloatingLabelInput
                    id="note-completed-date"
                    label="Data de Conclusão"
                    type="date"
                    {...form.register("completedDate")}
                  />
                  {form.formState.errors.completedDate && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.completedDate.message}</p>
                  )}
                </div>
                
                <div className="relative">
                  <select 
                    id="note-status" 
                    className="w-full px-3 pt-6 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                    {...form.register("status")}
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                  <label htmlFor="note-status" className="absolute left-3 top-2 text-xs text-gray-500">
                    Status
                  </label>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1 text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
                    style={{ backgroundColor: '#28a745' }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#218838'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#28a745'}
                    disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  {editingNote && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="px-4"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg material-shadow">
              
              {/* Filters Header */}
              <div className="p-6 border-b border-surface-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <List className="w-5 h-5 text-primary-500 mr-2" />
                    Minhas Anotações
                  </h2>
                  
                  {/* Filter Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setFilter("all")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filter === "all" 
                          ? "text-white" 
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      style={filter === "all" ? { backgroundColor: '#28a745' } : {}}
                    >
                      Todas
                    </button>
                    <button 
                      onClick={() => setFilter("todo")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filter === "todo" 
                          ? "text-white" 
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      style={filter === "todo" ? { backgroundColor: '#28a745' } : {}}
                    >
                      A Fazer
                    </button>
                    <button 
                      onClick={() => setFilter("completed")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filter === "completed" 
                          ? "text-white" 
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      style={filter === "completed" ? { backgroundColor: '#28a745' } : {}}
                    >
                      Concluídas
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notes List Container */}
              <div className="divide-y divide-surface-200">
                {notesLoading ? (
                  <div className="p-12 text-center">
                    <div className="text-lg">Carregando anotações...</div>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="p-12 text-center">
                    <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma anotação encontrada</h3>
                    <p className="text-gray-600">Crie sua primeira anotação usando o formulário ao lado.</p>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <div key={note.id} className="p-6 hover:bg-surface-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-base font-medium text-gray-900">{note.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              note.status === "A Fazer" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-success-50 text-success-600"
                            }`}>
                              {note.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <CalendarPlus className="w-4 h-4 mr-2 text-gray-400" />
                              <span>Criada em: <span>{new Date(note.createdDate).toLocaleDateString('pt-BR')}</span></span>
                            </div>
                            <div className="flex items-center">
                              <CalendarCheck className={`w-4 h-4 mr-2 ${note.completedDate ? 'text-success-500' : 'text-gray-400'}`} />
                              <span>
                                {note.completedDate ? (
                                  <>Concluída em: <span className="text-success-600 font-medium">{new Date(note.completedDate).toLocaleDateString('pt-BR')}</span></>
                                ) : (
                                  "Conclusão: <span className='text-gray-400'>Não definida</span>"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {note.status === "A Fazer" && (
                            <button 
                              onClick={() => markCompletedMutation.mutate(note.id)}
                              className="text-gray-400 hover:text-success-500 transition-colors"
                              title="Marcar como Feita"
                              disabled={markCompletedMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(note)}
                            className="text-gray-400 hover:text-primary-500 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                            disabled={deleteNoteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
