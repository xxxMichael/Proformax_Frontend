import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import ProductModal from "../components/ProductModal";
import ViewProductModal from "../components/ViewProductModal";
import DeleteModal from "../components/DeleteModal";
import Table from "../components/Table";

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productService";

import "./products.css";

// Tipos disponibles para el filtro
const TIPOS = [
  { value: "", label: "Todos los tipos" },
  { value: "producto", label: "Producto" },
  { value: "servicio", label: "Servicio" },
  { value: "material", label: "Material" },
  { value: "acabado", label: "Acabado" },
  { value: "accesorio", label: "Accesorio" },
];

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const resp = await getProductos(1, 20, search, filtroTipo);
      setProductos(resp.data);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  // 🟡 EDITAR
  const abrirEditar = (producto) => {
    setProductoSeleccionado(producto);
    setOpenEditModal(true);
  };

  // 👁‍🗨 VER
  const abrirVer = (producto) => {
    setProductoSeleccionado(producto);
    setOpenViewModal(true);
  };

  // ❌ DESACTIVAR
  const abrirEliminar = (producto) => {
    setProductoSeleccionado(producto);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProducto(productoSeleccionado.id);

      setOpenDeleteModal(false);
      loadProductos();
    } catch (error) {
      console.error("Error desactivando producto", error);
    }
  };

  // 🟢 CREAR
  const handleCreate = async (data) => {
    try {
      await createProducto({
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        precioBase: parseFloat(data.precioBase),
        stockActual: data.tipo === "servicio" ? 0 : parseInt(data.stockActual),
        aplicaIva: data.aplicaIva,
        estado: true,
      });

      setOpenNewModal(false);
      loadProductos();
    } catch (error) {
      console.error("Error creando producto", error);
    }
  };

  // 🔵 EDITAR
  const handleEdit = async (data) => {
    try {
      await updateProducto(productoSeleccionado.id, {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        precioBase: parseFloat(data.precioBase),
        stockActual: data.tipo === "servicio" ? 0 : parseInt(data.stockActual),
        aplicaIva: data.aplicaIva,
        estado: true,
      });

      setOpenEditModal(false);
      loadProductos();
    } catch (error) {
      console.error("Error actualizando producto", error);
    }
  };

  // Badge de tipo con color
  const renderTipoBadge = (tipo) => (
    <span className={`badge-tipo ${tipo}`}>{tipo}</span>
  );

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="productos-content">

          {/* 🔍 FILTROS */}
          <div className="productos-top">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <button className="btn-buscar" onClick={loadProductos}>
              Buscar
            </button>

            <button className="btn-nuevo" onClick={() => setOpenNewModal(true)}>
              + Nuevo Producto
            </button>
          </div>

          {/* 🧠 TABLA */}
          <Table
            headers={[
              "#",
              "Código",
              "Nombre",
              "Tipo",
              "Precio",
              "Stock",
              "IVA",
              "Acciones",
            ]}
            rows={productos.map((p, i) => [
              i + 1,
              p.codigo,
              p.nombre,
              renderTipoBadge(p.tipo),
              `$${parseFloat(p.precioBase).toFixed(2)}`,
              p.tipo === "servicio" ? "N/A" : p.stockActual,
              p.aplicaIva ? "Sí" : "No",
            ])}
            itemsPerPage={6}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(index) => abrirVer(productos[index])}
            onEdit={(index) => abrirEditar(productos[index])}
            onDelete={(index) => abrirEliminar(productos[index])}
          />

        </div>
      </div>

      {/* 🟢 MODAL NUEVO */}
      <ProductModal
        isOpen={openNewModal}
        onClose={() => setOpenNewModal(false)}
        mode="create"
        onSave={handleCreate}
      />

      {/* 🔵 EDITAR */}
      <ProductModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        mode="edit"
        productoId={productoSeleccionado?.id}
        initialData={
          productoSeleccionado && {
            codigo: productoSeleccionado.codigo,
            nombre: productoSeleccionado.nombre,
            descripcion: productoSeleccionado.descripcion,
            tipo: productoSeleccionado.tipo,
            precioBase: productoSeleccionado.precioBase,
            stockActual: productoSeleccionado.stockActual,
            aplicaIva: productoSeleccionado.aplicaIva,
          }
        }
        onSave={handleEdit}
      />

      {/* 👁‍🗨 VER */}
      <ViewProductModal
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        producto={productoSeleccionado}
      />

      {/* ❌ DESACTIVAR */}
      <DeleteModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDelete}
        title="Desactivar Producto"
        message="¿Seguro que deseas desactivar este producto? El registro no se eliminará, solo cambiará a estado inactivo."
      />
    </div>
  );
}