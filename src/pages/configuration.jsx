import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import toast from "react-hot-toast";
import { getConfig, updateConfig } from "../services/configService";
import "./config.css";

export default function Configuration() {
  const [config, setConfig] = useState({
    ruc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    email: "",
    porcentajeIvaVigente: 15,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const resp = await getConfig();
      if (resp.success) {
        setConfig(resp.data);
      }
      // Cargar logo guardado localmente
      const savedLogo = localStorage.getItem("empresa_logo");
      if (savedLogo) setLogoPreview(savedLogo);
    } catch (error) {
      toast.error("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: value,
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // Limite de 2MB
        toast.error("La imagen es muy pesada (máx 2MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig(config);
      // Guardar logo en localStorage para usarlo en todo el sistema
      if (logoPreview) {
        localStorage.setItem("empresa_logo", logoPreview);
        // Disparar evento para que Header y Sidebar se actualicen al instante
        window.dispatchEvent(new Event("logo_updated"));
      }
      toast.success("Configuración guardada");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="config-container-new">
          <h2 className="section-title">Perfil de la empresa</h2>

          <div className="config-content-grid">
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <form onSubmit={handleSubmit} className="config-form-new">
              <div className="form-row-new">
                <div className="form-group-new">
                  <label>Nombre de la empresa:</label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={config.razonSocial}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group-new">
                  <label>RUC:</label>
                  <input
                    type="text"
                    name="ruc"
                    value={config.ruc}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row-new">
                <div className="form-group-new">
                  <label>Dirección:</label>
                  <input
                    type="text"
                    name="direccion"
                    value={config.direccion}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group-new">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    name="telefono"
                    value={config.telefono}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row-new" style={{ marginTop: '10px' }}>
                <div className="form-group-new" style={{ maxWidth: '200px' }}>
                  <label>IVA Vigente (%):</label>
                  <input
                    type="number"
                    name="porcentajeIvaVigente"
                    value={config.porcentajeIvaVigente}
                    onChange={(e) => setConfig({...config, porcentajeIvaVigente: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="config-actions-new">
                <button type="button" className="btn-cancel-new" onClick={loadConfig}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-new" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>

            {/* COLUMNA DERECHA: LOGO/IMAGEN */}
            <div className="config-image-section">
              <div className="image-placeholder">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="logo-img-preview" />
                ) : (
                  <div className="no-logo-text">Sin Logo</div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <button className="btn-upload-image" onClick={handleImageClick}>
                + Cargar Imagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}