import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Table from "../components/Table";
import UserModal from "../components/UserModal";
import ViewUserModal from "../components/ViewUserModal";
import ErrorModal from "../components/ErrorModal";
import { getUsuarios, createUsuario, updateUsuario, patchEstadoUsuario } from "../services/userService";
import { RefreshCcw, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

import "./users.css";

export default function Usuarios() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  
  const [page, setPage] = useState(1);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    if (user?.rol === "ADMIN") {
      loadUsuarios();
    }
  }, [filtroRol, filtroEstado, page]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const resp = await getUsuarios(page, 10, filtroRol, filtroEstado, filtroBusqueda);
      setUsuarios(resp.data || []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFiltroRol("");
    setFiltroEstado("");
    setFiltroBusqueda("");
    setPage(1);
    setTimeout(() => loadUsuarios(), 0);
  };

  // 🟢 CREAR
  const handleCreate = async (data) => {
    try {
      await createUsuario({
        username: data.username,
        password: data.password,
        rol: data.rol,
        email: data.email,
      });
      setOpenNewModal(false);
      toast.success("Usuario creado exitosamente");
      loadUsuarios();
    } catch (error) {
      console.error("Error creando usuario", error);
      let msg = error.message || "No se pudo crear el usuario.";
      if (error.errors && Array.isArray(error.errors)) {
        msg = error.errors.map(e => e.msg || e.message).join(", ");
      }
      setErrorModal({
        isOpen: true,
        message: msg
      });
    }
  };

  // 🔵 EDITAR
  const handleEdit = async (data) => {
    try {
      const payload = {
        username: data.username,
        rol: data.rol,
        email: data.email,
      };
      if (data.password) {
        payload.password = data.password;
      }

      await updateUsuario(usuarioSeleccionado.id, payload);
      setOpenEditModal(false);
      toast.success("Usuario actualizado exitosamente");
      loadUsuarios();
    } catch (error) {
      console.error("Error actualizando usuario", error);
      let msg = error.message || "Error al actualizar los datos del usuario.";
      if (error.errors && Array.isArray(error.errors)) {
        msg = error.errors.map(e => e.msg || e.message).join(", ");
      }
      setErrorModal({
        isOpen: true,
        message: msg
      });
    }
  };

  // 🟡 TOGGLE ESTADO (Baja/Alta Lógica)
  const handleToggleEstado = async (index) => {
    const user = usuarios[index];
    if (!user) return;

    if (user.id === currentUser?.id) {
      toast.error("No puedes cambiar tu propio estado de acceso");
      return;
    }

    try {
      await patchEstadoUsuario(user.id, !user.estado);
      toast.success(`Usuario ${!user.estado ? "activado" : "desactivado"} exitosamente`);
      loadUsuarios();
    } catch (error) {
      console.error("Error cambiando estado", error);
      toast.error("Error al cambiar el estado del usuario");
    }
  };

  // 👁‍🗨 VER
  const abrirVer = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setOpenViewModal(true);
  };

  // ✏️ EDITAR
  const abrirEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setOpenEditModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  if (currentUser?.rol !== "ADMIN") {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Header />
          <div className="usuarios-content">
            <div className="access-denied">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", color: "#ef4444" }}>
                <ShieldAlert size={64} />
              </div>
              <h2>Acceso Restringido</h2>
              <p>Este módulo es exclusivo para administradores del sistema (Rol ADMIN).</p>
              <button onClick={() => window.location.href = "/home"}>Volver al Inicio</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="usuarios-content">
          <div className="premium-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por usuario..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    loadUsuarios();
                  }
                }}
              />
            </div>

            <select
              className="filter-select-premium"
              value={filtroRol}
              onChange={(e) => { setFiltroRol(e.target.value); setPage(1); }}
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="vendedor">Vendedor</option>
            </select>

            <select
              className="filter-select-premium"
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>

            <button className="btn-clear-filters" onClick={handleClearFilters}>
              🗑️ Limpiar filtros
            </button>

            <div className="spacer"></div>

            <button className="btn-create-new" onClick={() => setOpenNewModal(true)}>
              <span>+</span> Nuevo Usuario
            </button>
          </div>

          {/* TABLA */}
          <Table
            headers={["#", "Usuario", "Rol", "Creado En", "Estado", "Acciones"]}
            rows={usuarios.map((u, i) => [
              (page - 1) * 10 + i + 1,
              <strong key={`usr-${u.id}`}>{u.username}</strong>,
              <span key={`rol-${u.id}`} className={`badge-rol ${u.rol?.toLowerCase()}`}>
                {u.rol}
              </span>,
              formatDate(u.creadoEn),
              <span key={`est-${u.id}`} className={`badge-estado ${u.estado ? "activo" : "inactivo"}`}>
                {u.estado ? "ACTIVO" : "INACTIVO"}
              </span>,
            ])}
            loading={loading}
            itemsPerPage={10}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(index) => abrirVer(usuarios[index])}
            onEdit={(index) => abrirEditar(usuarios[index])}
            onCustomAction={(index) => handleToggleEstado(index)}
            customActionIcon={<RefreshCcw size={14} />} customActionTitle="Activar / Desactivar Usuario"
          />
        </div>
      </div>

      {/* 🟢 MODAL NUEVO */}
      <UserModal
        isOpen={openNewModal}
        onClose={() => setOpenNewModal(false)}
        mode="create"
        onSave={handleCreate}
      />

      {/* 🔵 MODAL EDITAR */}
      <UserModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        mode="edit"
        initialData={usuarioSeleccionado}
        onSave={handleEdit}
      />

      {/* 👁‍🗨 MODAL VER */}
      <ViewUserModal
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        usuario={usuarioSeleccionado}
      />

      {/* 🚨 MODAL ERROR */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        title="Operación Fallida"
        message={errorModal.message}
      />
    </div>
  );
}
