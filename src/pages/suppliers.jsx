import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import SupplierModal from "../components/SupplierModal";
import ViewSupplierModal from "../components/ViewSupplierModal";
import DeleteModal from "../components/DeleteModal";
import Table from "../components/Table";

import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../services/supplierService";

import "./suppliers.css";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState("");

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const resp = await getProveedores(1, 20, search);
      setProveedores(resp.data);
    } catch (error) {
      console.error("Error cargando proveedores", error);
    }
  };

  // 🟡 EDITAR
  const abrirEditar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setOpenEditModal(true);
  };

  // 👁‍🗨 VER
  const abrirVer = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setOpenViewModal(true);
  };

  // ❌ ELIMINAR (baja lógica)
  const abrirEliminar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProveedor(proveedorSeleccionado.id);
      toast.success("Proveedor desactivado exitosamente");
      setOpenDeleteModal(false);
      loadProveedores();
    } catch (error) {
      console.error("Error desactivando proveedor", error);
      toast.error("Error al desactivar el proveedor");
    }
  };

  // 🟢 CREAR
  const handleCreate = async (data) => {
    try {
      await createProveedor({
        identificacion: data.identificacion,
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        estado: true,
      });
      toast.success("Proveedor creado exitosamente");
      setOpenNewModal(false);
      loadProveedores();
    } catch (error) {
      console.error("Error creando proveedor", error);
      toast.error(error.response?.data?.message || "Error al crear el proveedor");
    }
  };

  // 🔵 EDITAR
  const handleEdit = async (data) => {
    try {
      await updateProveedor(proveedorSeleccionado.id, {
        identificacion: data.identificacion,
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        estado: true,
      });
      toast.success("Proveedor actualizado exitosamente");
      setOpenEditModal(false);
      loadProveedores();
    } catch (error) {
      console.error("Error actualizando proveedor", error);
      toast.error(error.response?.data?.message || "Error al actualizar el proveedor");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setTimeout(() => loadProveedores(), 0);
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="proveedores-content">

          {/* ========== BARRA DE HERRAMIENTAS PREMIUM ========== */}
          <div className="premium-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por razón social o RUC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && loadProveedores()}
              />
            </div>

            <button className="btn-clear-filters" onClick={handleClearFilters}>
              🗑️ Limpiar filtros
            </button>

            <div className="spacer"></div>

            <button className="btn-create-new" onClick={() => setOpenNewModal(true)}>
              <span>+</span> Nuevo Proveedor
            </button>
          </div>

          {/* 🧠 TABLA */}
          <Table
            headers={[
              "#",
              "Identificación",
              "Razón Social",
              "Nombre Comercial",
              "Teléfono",
              "Email",
              "Acciones",
            ]}
            rows={proveedores.map((p, i) => [
              i + 1,
              p.identificacion,
              p.razonSocial,
              p.nombreComercial || "—",
              p.telefono,
              p.email,
            ])}
            itemsPerPage={6}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(index) => abrirVer(proveedores[index])}
            onEdit={(index) => abrirEditar(proveedores[index])}
            onDelete={(index) => abrirEliminar(proveedores[index])}
          />

        </div>
      </div>

      {/* 🟢 MODAL NUEVO */}
      <SupplierModal
        isOpen={openNewModal}
        onClose={() => setOpenNewModal(false)}
        mode="create"
        onSave={handleCreate}
      />

      {/* 🔵 EDITAR */}
      <SupplierModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        mode="edit"
        proveedorId={proveedorSeleccionado?.id}
        initialData={
          proveedorSeleccionado && {
            identificacion: proveedorSeleccionado.identificacion,
            razonSocial: proveedorSeleccionado.razonSocial,
            nombreComercial: proveedorSeleccionado.nombreComercial,
            direccion: proveedorSeleccionado.direccion,
            telefono: proveedorSeleccionado.telefono,
            email: proveedorSeleccionado.email,
          }
        }
        onSave={handleEdit}
      />

      {/* 👁‍🗨 VER */}
      <ViewSupplierModal
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        proveedor={proveedorSeleccionado}
      />

      {/* ❌ DESACTIVAR */}
      <DeleteModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDelete}
        title="Desactivar Proveedor"
        message="¿Seguro que deseas desactivar este proveedor? El registro no se eliminará, solo cambiará a estado inactivo."
      />
    </div>
  );
}