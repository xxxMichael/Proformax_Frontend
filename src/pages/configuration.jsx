import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getConfig, updateConfig } from "../services/configService";

import "./configuration.css";

export default function Configuracion() {
  const [form, setForm] = useState({
    ruc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    email: "",
    porcentajeIvaVigente: "",
  });

  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar logo guardado en localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem("empresa_logo");
    if (savedLogo) setLogoPreview(savedLogo);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no debe superar 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setLogoPreview(dataUrl);
      localStorage.setItem("empresa_logo", dataUrl);
      toast.success("Imagen cargada correctamente");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const resp = await getConfig();
      const data = resp.data;

      const formData = {
        ruc: data.ruc || "",
        razonSocial: data.razonSocial || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        email: data.email || "",
        porcentajeIvaVigente: data.porcentajeIvaVigente ?? "",
      };

      setForm(formData);
      setOriginal(formData);
    } catch (error) {
      console.error("Error cargando configuración", error);
      toast.error("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Solo números para RUC y teléfono
    if (name === "ruc" || name === "telefono") {
      setForm({ ...form, [name]: value.replace(/\D/g, "") });
      return;
    }

    // Validar porcentaje IVA
    if (name === "porcentajeIvaVigente") {
      const sanitized = value.replace(/[^0-9.]/g, "");
      const parts = sanitized.split(".");
      const clean =
        parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
      setForm({ ...form, [name]: clean });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const validarFormulario = () => {
    let newErrors = {};

    if (!form.ruc.trim()) {
      newErrors.ruc = "Ingrese el RUC";
    } else if (!/^\d{13}$/.test(form.ruc)) {
      newErrors.ruc = "RUC debe tener 13 dígitos";
    }

    if (!form.razonSocial.trim()) {
      newErrors.razonSocial = "Ingrese la razón social";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    const iva = parseFloat(form.porcentajeIvaVigente);
    if (isNaN(iva) || iva < 0 || iva > 100) {
      newErrors.porcentajeIvaVigente = "Ingrese un porcentaje válido (0-100)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setForm({ ...original });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validarFormulario()) return;

    try {
      setSaving(true);

      await updateConfig({
        ruc: form.ruc,
        razonSocial: form.razonSocial,
        direccion: form.direccion,
        telefono: form.telefono,
        email: form.email,
        porcentajeIvaVigente: parseFloat(form.porcentajeIvaVigente),
      });

      setOriginal({ ...form });
      toast.success("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error guardando configuración", error);
      toast.error(error.message || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="configuracion-content">
          <h1>Configuración</h1>

          {loading ? (
            <div className="config-loading">Cargando configuración...</div>
          ) : (
            <div className="config-card">
              <h2>Perfil de la empresa</h2>

              <div className="config-layout">
                {/* ========== FORMULARIO ========== */}
                <div>
                  <div className="config-form-grid">
                    {/* Razón Social */}
                    <div>
                      <label>Nombre de la empresa:</label>
                      <input
                        name="razonSocial"
                        value={form.razonSocial}
                        onChange={handleChange}
                        placeholder="Razón social"
                      />
                      {errors.razonSocial && (
                        <span className="field-error">
                          {errors.razonSocial}
                        </span>
                      )}
                    </div>

                    {/* RUC */}
                    <div>
                      <label>RUC:</label>
                      <input
                        name="ruc"
                        value={form.ruc}
                        onChange={handleChange}
                        placeholder="0000000000001"
                        maxLength={13}
                      />
                      {errors.ruc && (
                        <span className="field-error">{errors.ruc}</span>
                      )}
                    </div>

                    {/* Dirección */}
                    <div>
                      <label>Dirección:</label>
                      <input
                        name="direccion"
                        value={form.direccion}
                        onChange={handleChange}
                        placeholder="Dirección de la empresa"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label>Teléfono:</label>
                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        placeholder="0999999999"
                      />
                    </div>

                    {/* Email */}
                    <div className="full-width">
                      <label>Email:</label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="correo@empresa.com"
                      />
                      {errors.email && (
                        <span className="field-error">{errors.email}</span>
                      )}
                    </div>
                  </div>

                  {/* ========== IVA ========== */}
                  <div className="config-iva-section">
                    <h3>Porcentaje de IVA vigente</h3>
                    <div className="iva-input-row">
                      <input
                        name="porcentajeIvaVigente"
                        value={form.porcentajeIvaVigente}
                        onChange={handleChange}
                        placeholder="15"
                      />
                      <span className="iva-symbol">%</span>
                    </div>
                    {errors.porcentajeIvaVigente && (
                      <span className="field-error">
                        {errors.porcentajeIvaVigente}
                      </span>
                    )}
                  </div>
                </div>

                {/* ========== LOGO AREA ========== */}
                <div className="config-logo-area">
                  <div className="logo-preview">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo empresa" />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Cargar Imagen
                  </button>
                </div>
              </div>

              {/* ========== BOTONES ========== */}
              <div className="config-buttons">
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancelar
                </button>
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}