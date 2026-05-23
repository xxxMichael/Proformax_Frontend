import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Calendar, Percent, Package, Plus, Trash2, Save, FileText, User, ChevronLeft, ChevronRight } from "lucide-react";
import "./proformaModal.css";

import { getClientes } from "../services/clientService";
import { getProductos } from "../services/productService";
import { createProforma, updateProforma } from "../services/proformaService";
import { getConfig } from "../services/configService";
import toast from "react-hot-toast";

export default function ProformaModal({
  isOpen,
  onClose,
  onSuccess,
  editingProforma = null,
}) {
  const isEditing = !!editingProforma;

  const emptyDetalle = { productoServicioId: "", cantidad: 1, precioUnitario: "" };
  const [form, setForm] = useState({
    clienteId: "",
    fechaValidez: "",
    porcentajeDescuento: 0,
    observaciones: "",
    detalles: [{ ...emptyDetalle }],
  });

  const [aplicaIva, setAplicaIva] = useState(true);

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientFilter, setClientFilter] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [porcentajeIva, setPorcentajeIva] = useState(15);
  const resultsPerPage = 5;

  useEffect(() => {
    if (!isOpen) return;
    const cargarCatalogos = async () => {
      try {
        const [rc, rp, resConfig] = await Promise.all([getClientes(1, 100, ""), getProductos(1, 100, ""), getConfig()]);
        setClientes(rc.data || []);
        setProductos(rp.data || []);
        if (resConfig?.data?.porcentajeIvaVigente) {
          setPorcentajeIva(resConfig.data.porcentajeIvaVigente);
        }
      } catch (e) { console.error(e); }
    };
    cargarCatalogos();

    if (isEditing) {
      setForm({
        clienteId: editingProforma.clienteId.toString(),
        fechaValidez: editingProforma.fechaValidez ? new Date(editingProforma.fechaValidez).toISOString().split("T")[0] : "",
        porcentajeDescuento: editingProforma.porcentajeDescuento ?? 0,
        observaciones: editingProforma.observaciones || "",
        detalles: editingProforma.detalles?.map(d => ({
          productoServicioId: d.productoServicioId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })) || [{ ...emptyDetalle }],
      });
      // Si la proforma guardada no tiene IVA, desmarcar el checkbox
      setAplicaIva(parseFloat(editingProforma.totalIva ?? editingProforma.iva ?? 1) > 0);
    } else {
      setForm({
        clienteId: "",
        fechaValidez: new Date().toISOString().split("T")[0],
        porcentajeDescuento: 0,
        observaciones: "",
        detalles: [{ ...emptyDetalle }],
      });
      setAplicaIva(true);
    }
    setSearchPage(1);
    setClientFilter("");
  }, [isOpen, editingProforma]);

  const subtotal = form.detalles.reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.precioUnitario) || 0), 0);
  const descuento = subtotal * (Number(form.porcentajeDescuento) / 100);
  const iva = aplicaIva ? (subtotal - descuento) * (porcentajeIva / 100) : 0;
  const total = subtotal - descuento + iva;

  const handleSave = async () => {
    if (!form.clienteId) return toast.error("Debe seleccionar un cliente");

    // Validar stock disponible para productos (no servicios)
    for (const d of form.detalles) {
      const prod = productos.find(p => p.id === parseInt(d.productoServicioId));
      if (prod && prod.tipo !== "servicio" && Number(d.cantidad) > prod.stockActual) {
        return toast.error(
          `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stockActual}, solicitado: ${d.cantidad}`
        );
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        clienteId: parseInt(form.clienteId),
        aplicaIva,
        detalles: form.detalles.map(d => ({ ...d, productoServicioId: parseInt(d.productoServicioId) }))
      };
      if (isEditing) await updateProforma(editingProforma.id, payload);
      else await createProforma(payload);
      toast.success(isEditing ? "Actualizada" : "Creada");
      onSuccess();
      onClose();
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  const filteredClients = clientes.filter(c => 
    `${c.nombres} ${c.apellidosRazonSocial}`.toLowerCase().includes(clientFilter.toLowerCase()) || 
    c.identificacion.includes(clientFilter)
  );
  const totalSearchPages = Math.ceil(filteredClients.length / resultsPerPage) || 1;
  const paginatedClients = filteredClients.slice((searchPage - 1) * resultsPerPage, searchPage * resultsPerPage);

  if (!isOpen) return null;

  return createPortal(
    <div className="proforma-modal-overlay">
      <div className="proforma-modal-premium">
        <div className="modal-form-side">
          <div className="modal-header-simple">
            <div className="title-group">
              <FileText className="icon-main" />
              <div>
                <h2>{isEditing ? "Editar Proforma" : "Nueva Proforma"}</h2>
                <span>Complete los campos para generar el documento</span>
              </div>
            </div>
            <button className="btn-close-minimal" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-sections-container">
            <div className="section-block">
              <div className="section-title"><User size={14} /> Información del Cliente</div>
              <div className="client-selector-card">
                {form.clienteId ? (
                  <div className="client-info-row">
                    <div className="client-avatar">{clientes.find(c => c.id === parseInt(form.clienteId))?.nombres?.charAt(0)}</div>
                    <div className="client-details">
                      <strong>{clientes.find(c => c.id === parseInt(form.clienteId))?.nombres} {clientes.find(c => c.id === parseInt(form.clienteId))?.apellidosRazonSocial}</strong>
                      <span>ID: {clientes.find(c => c.id === parseInt(form.clienteId))?.identificacion}</span>
                    </div>
                    {!isEditing && (
                      <button className="btn-change-client" onClick={() => setShowClientSearch(true)}>Cambiar</button>
                    )}
                  </div>
                ) : (
                  <button className="btn-select-client-empty" onClick={() => setShowClientSearch(true)}>
                    <Search size={16} /> Haga clic para seleccionar un cliente
                  </button>
                )}
              </div>
            </div>

            <div className="section-block">
              <div className="section-title"><Calendar size={14} /> Condiciones de Venta</div>
              <div className="form-row-2">
                <div className="input-group-stack">
                  <label>Fecha de Validez:</label>
                  <div className="input-with-icon">
                    <Calendar size={14} className="input-icon" />
                    <input type="date" name="fechaValidez" value={form.fechaValidez} onChange={e => setForm({...form, fechaValidez: e.target.value})} />
                  </div>
                </div>
                <div className="input-group-stack">
                  <label>Descuento Global (%):</label>
                  <div className="input-with-icon">
                    <Percent size={14} className="input-icon" />
                    <input type="number" placeholder="0" value={form.porcentajeDescuento} onChange={e => setForm({...form, porcentajeDescuento: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="section-block">
              <div className="section-title"><Package size={14} /> Detalle de Productos</div>
              <div className="items-list">
                {form.detalles.map((d, i) => (
                  <div key={i} className="item-row-card">
                    <div className="input-group-stack flex-2">
                      <label>Producto:</label>
                      <select value={d.productoServicioId} onChange={e => {
                        const nuevos = [...form.detalles];
                        nuevos[i].productoServicioId = e.target.value;
                        const prod = productos.find(p => p.id === parseInt(e.target.value));
                        if (prod) nuevos[i].precioUnitario = prod.precioBase;
                        setForm({...form, detalles: nuevos});
                      }}>
                        <option value="">Seleccionar...</option>
                        {productos.map(p => {
                          const isSelected = p.id === parseInt(d.productoServicioId);
                          if (p.estado === false && !isSelected) return null;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.nombre} {p.estado === false ? "(INACTIVO)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="input-group-stack flex-0-5">
                      <label>Cant:</label>
                      <input type="number" value={d.cantidad} onChange={e => {
                        const nuevos = [...form.detalles];
                        nuevos[i].cantidad = e.target.value;
                        setForm({...form, detalles: nuevos});
                      }} />
                    </div>
                    <div className="input-group-stack flex-0-8">
                      <label>Precio:</label>
                      <input type="number" value={d.precioUnitario} onChange={e => {
                        const nuevos = [...form.detalles];
                        nuevos[i].precioUnitario = e.target.value;
                        setForm({...form, detalles: nuevos});
                      }} />
                    </div>
                    <button className="btn-remove-item" onClick={() => {
                      if (form.detalles.length > 1) setForm({...form, detalles: form.detalles.filter((_, idx) => idx !== i)});
                    }}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button className="btn-add-item-modern" onClick={() => setForm({...form, detalles: [...form.detalles, {...emptyDetalle}]})}>
                  <Plus size={14} /> Añadir otro producto
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-summary-side">
          <div className="summary-card">
            <h3>Resumen</h3>
            <div className="summary-row"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row discount"><span>Desc:</span><span>-${descuento.toFixed(2)}</span></div>

            {/* ── Checkbox IVA ── */}
            <div className="summary-iva-toggle">
              <label className="iva-check-label">
                <input
                  type="checkbox"
                  checked={aplicaIva}
                  onChange={(e) => setAplicaIva(e.target.checked)}
                />
                <span>Aplicar IVA {porcentajeIva}%</span>
              </label>
              <span className={`iva-amount ${!aplicaIva ? "iva-disabled" : ""}`}>
                ${iva.toFixed(2)}
              </span>
            </div>

            <div className="summary-divider"></div>
            <div className="summary-total"><label>TOTAL</label><div className="amount">${total.toFixed(2)}</div></div>
          </div>
          <div className="observations-card">
            <label>Observaciones:</label>
            <textarea value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Notas..." style={{ resize: 'none' }} />
          </div>
          <div className="actions-card">
            <button className="btn-save-full" onClick={handleSave} disabled={loading}><Save size={18} /> {loading ? "Procesando..." : isEditing ? "Actualizar" : "Generar"}</button>
            <button className="btn-cancel-full" onClick={onClose}>Cancelar</button>
          </div>
        </div>

        {showClientSearch && (
          <div className="search-overlay-modern">
            <div className="search-card-modern">
              <div className="search-header">
                <h3>Buscar Cliente</h3>
                <button onClick={() => setShowClientSearch(false)}><X size={16} /></button>
              </div>
              <div className="search-input-group">
                <Search size={16} />
                <input type="text" placeholder="Nombre o ID..." value={clientFilter} onChange={e => {setClientFilter(e.target.value); setSearchPage(1);}} autoFocus />
              </div>
              <div className="search-results-modern">
                {paginatedClients.map(c => (
                  <div key={c.id} className="client-result-item" onClick={() => { setForm({...form, clienteId: c.id.toString()}); setShowClientSearch(false); }}>
                    <strong>{c.nombres} {c.apellidosRazonSocial}</strong>
                    <span>{c.identificacion}</span>
                  </div>
                ))}
              </div>
              <div className="search-pagination-controls">
                <button disabled={searchPage === 1} onClick={() => setSearchPage(searchPage - 1)} className="btn-page-nav"><ChevronLeft size={14} /></button>
                <span>Pág {searchPage} / {totalSearchPages}</span>
                <button disabled={searchPage === totalSearchPages} onClick={() => setSearchPage(searchPage + 1)} className="btn-page-nav"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
