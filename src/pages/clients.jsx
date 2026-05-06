import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import ClientModal from "../components/ClientModal";
import ViewModal from "../components/ViewModal";
import DeleteModal from "../components/DeleteModal"; 
import Table from "../components/Table"; 

import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente
} from "../services/clientService";

import "./clients.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const resp = await getClientes(1, 100, search);
      setClientes(resp.data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    // Usamos setTimeout para asegurar que el estado se limpie antes de cargar
    setTimeout(() => loadClientes(), 0);
  };

  // 🟡 EDITAR
  const abrirEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenEditModal(true);
  };

  // 👁‍🗨 VER
  const abrirVer = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenViewModal(true);
  };

  // ❌ ELIMINAR
  const abrirEliminar = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCliente(clienteSeleccionado.id);
      setOpenDeleteModal(false);
      loadClientes();
    } catch (error) {
      console.error("Error eliminando cliente", error);
    }
  };

  // 🟢 CREAR
  const handleCreate = async (data) => {
    try {
      await createCliente({
        identificacion: data.idNumber,
        nombres: data.names,
        apellidosRazonSocial: data.lastnames,
        email: data.email,
        telefono: data.phone,
        direccion: "Sin dirección"
      });
      setOpenNewModal(false);
      loadClientes();
    } catch (error) {
      console.error("Error creando cliente", error);
    }
  };

  // 🔵 EDITAR
  const handleEdit = async (data) => {
    try {
      await updateCliente(clienteSeleccionado.id, {
        identificacion: data.idNumber,
        nombres: data.names,
        apellidosRazonSocial: data.lastnames,
        email: data.email,
        telefono: data.phone,
        direccion: "Sin dirección"
      });
      setOpenEditModal(false);
      loadClientes();
    } catch (error) {
      console.error("Error actualizando cliente", error);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="clientes-content">

          {/* ========== BARRA DE HERRAMIENTAS PREMIUM ========== */}
          <div className="premium-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar cliente por nombre o identificación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && loadClientes()}
              />
            </div>

            <button className="btn-clear-filters" onClick={handleClearFilters}>
              🗑️ Limpiar filtros
            </button>

            <div className="spacer"></div>

            <button className="btn-create-new" onClick={() => setOpenNewModal(true)}>
              <span>+</span> Nuevo Cliente
            </button>
          </div>

          {/* 🧠 TABLA */}
          <Table
            headers={[
              "#",
              "Identificación",
              "Cliente",
              "Teléfono",
              "Email",
              "Acciones"
            ]}
            rows={clientes.map((c, i) => [
              i + 1,
              c.identificacion,
              `${c.nombres} ${c.apellidosRazonSocial}`,
              c.telefono,
              c.email,
            ])}
            itemsPerPage={6}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(index) => abrirVer(clientes[index])}
            onEdit={(index) => abrirEditar(clientes[index])}
            onDelete={(index) => abrirEliminar(clientes[index])}
          />

        </div>
      </div>

      {/* 🟢 MODAL NUEVO */}
      <ClientModal
        isOpen={openNewModal}
        onClose={() => setOpenNewModal(false)}
        mode="create"
        onSave={handleCreate}
      />

      {/* 🔵 EDITAR */}
      <ClientModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        mode="edit"
        clienteId={clienteSeleccionado?.id}
        initialData={
          clienteSeleccionado && {
            idNumber: clienteSeleccionado.identificacion,
            names: clienteSeleccionado.nombres,
            lastnames: clienteSeleccionado.apellidosRazonSocial,
            phone: clienteSeleccionado.telefono,
            email: clienteSeleccionado.email,
          }
        }
        onSave={handleEdit}
      />

      {/* 👁‍🗨 VER */}
      <ViewModal
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        cliente={clienteSeleccionado}
      />

      {/* ❌ ELIMINAR */}
      <DeleteModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message="¿Seguro que deseas eliminar este cliente? Esta acción no se puede deshacer."
      />
    </div>
  );
}