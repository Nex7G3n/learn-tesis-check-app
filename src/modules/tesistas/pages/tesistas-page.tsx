"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  AlertCircle,
  Loader2,
  X,
  Mail,
  User,
  Save,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface Alumno {
  id: string;
  nombre: string;
  correo: string;
}

export function TesistasPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAlumnos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/alumnos");
      if (!res.ok) throw new Error("Error cargando alumnos");
      const data = await res.json();
      setAlumnos(data.alumnos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlumnos();
  }, [loadAlumnos]);

  const filteredAlumnos = alumnos.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.correo.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingAlumno(null);
    setFormNombre("");
    setFormCorreo("");
    setIsModalOpen(true);
  };

  const openEditModal = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setFormNombre(alumno.nombre);
    setFormCorreo(alumno.correo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAlumno(null);
    setFormNombre("");
    setFormCorreo("");
  };

  const handleSave = async () => {
    if (!formNombre.trim() || !formCorreo.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formCorreo)) {
      setError("Correo inválido");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingAlumno) {
        // Update
        const res = await fetch("/api/alumnos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAlumno.id,
            nombre: formNombre.trim(),
            correo: formCorreo.trim(),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al actualizar");
        }
      } else {
        // Create
        const res = await fetch("/api/alumnos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formNombre.trim(),
            correo: formCorreo.trim(),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al crear");
        }
      }

      closeModal();
      await loadAlumnos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError(null);
      const res = await fetch(`/api/alumnos?id=${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      setDeleteId(null);
      await loadAlumnos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Alumnos</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Gestiona los alumnos registrados en el sistema.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 animate-appear">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between animate-appear-delay">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-soft)]" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.03] border-[var(--line)] text-white placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--brand)]/50 focus:ring-[var(--brand)]/20 rounded-xl"
          />
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] rounded-xl font-semibold shadow-lg shadow-[var(--brand)]/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo alumno
        </Button>
      </div>

      {/* Table */}
      <div className="mesh-card border-[var(--line)] rounded-xl overflow-hidden animate-appear-delay">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[var(--brand)] animate-spin" />
          </div>
        ) : filteredAlumnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GraduationCap className="h-12 w-12 text-[var(--ink-soft)]/30 mb-4" />
            <p className="text-[var(--ink-soft)] text-sm">
              {search ? "No se encontraron alumnos con ese criterio" : "No hay alumnos registrados"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--line)] hover:bg-transparent">
                  <TableHead className="text-[var(--ink-soft)] font-semibold">Nombre</TableHead>
                  <TableHead className="text-[var(--ink-soft)] font-semibold">Correo</TableHead>
                  <TableHead className="text-[var(--ink-soft)] font-semibold w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumnos.map((alumno) => (
                  <TableRow
                    key={alumno.id}
                    className="border-[var(--line)] hover:bg-white/[0.03] transition-colors"
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
                          <User className="h-4 w-4 text-[var(--brand)]" />
                        </div>
                        {alumno.nombre}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--ink-soft)]">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[var(--ink-soft)]/60" />
                        {alumno.correo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <span className="sr-only">Acciones</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 7.84518 3.90482 8.125 4.25 8.125C4.59518 8.125 4.875 7.84518 4.875 7.5C4.875 7.15482 4.59518 6.875 4.25 6.875C3.90482 6.875 3.625 7.15482 3.625 7.5ZM6.875 7.5C6.875 7.84518 7.15482 8.125 7.5 8.125C7.84518 8.125 8.125 7.84518 8.125 7.5C8.125 7.15482 7.84518 6.875 7.5 6.875C7.15482 6.875 6.875 7.15482 6.875 7.5ZM10.125 7.5C10.125 7.84518 10.4048 8.125 10.75 8.125C11.0952 8.125 11.375 7.84518 11.375 7.5C11.375 7.15482 11.0952 6.875 10.75 6.875C10.4048 6.875 10.125 7.15482 10.125 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#0d1c31] border-[var(--line)] text-white"
                        >
                          <DropdownMenuItem
                            onClick={() => openEditModal(alumno)}
                            className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(alumno.id)}
                            className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0d1c31] border-[var(--line)] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingAlumno ? "Editar alumno" : "Nuevo alumno"}
            </DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              {editingAlumno
                ? "Modifica los datos del alumno."
                : "Completa los datos para registrar un nuevo alumno."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-white/80">
                <User className="h-3.5 w-3.5 inline mr-1.5" />
                Nombre completo
              </Label>
              <Input
                placeholder="Ej: Juan Pérez"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                className="bg-white/[0.03] border-[var(--line)] text-white placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--brand)]/50 focus:ring-[var(--brand)]/20 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-white/80">
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                Correo electrónico
              </Label>
              <Input
                type="email"
                placeholder="Ej: juan@universidad.edu"
                value={formCorreo}
                onChange={(e) => setFormCorreo(e.target.value)}
                className="bg-white/[0.03] border-[var(--line)] text-white placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--brand)]/50 focus:ring-[var(--brand)]/20 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeModal}
              className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white hover:text-white rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formNombre.trim() || !formCorreo.trim()}
              className="bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] rounded-xl font-semibold disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Guardando..." : editingAlumno ? "Guardar cambios" : "Crear alumno"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#0d1c31] border-[var(--line)] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar alumno?</DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              Esta acción no se puede deshacer. El alumno se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white hover:text-white rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-semibold disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
