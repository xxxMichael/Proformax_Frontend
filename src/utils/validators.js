/* ============================================================
   VALIDAR CÉDULA ECUATORIANA
   ============================================================ */
export const validarCedula = (cedula) => {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula[2]);
  if (tercerDigito >= 6) return false;

  let total = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(cedula[i]);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    total += num;
  }

  let verificador = 10 - (total % 10);
  if (verificador === 10) verificador = 0;

  return verificador === parseInt(cedula[9]);
};


/* ============================================================
   VALIDAR RUC ECUATORIANO
   - Debe ser cédula + "001" si es persona natural
   ============================================================ */
export const validarRuc = (ruc) => {
  if (!/^\d{13}$/.test(ruc)) return false;

  const cedula = ruc.substring(0, 10);
  const sufijo = ruc.substring(10);

  return validarCedula(cedula) && sufijo === "001";
};


/* ============================================================
   VALIDAR PASAPORTE (A-Z + dígitos)
   ============================================================ */
export const validarPasaporte = (pasaporte) => {
  return /^[A-Za-z0-9]{5,15}$/.test(pasaporte);
};


/* ============================================================
   VALIDAR EMAIL
   ============================================================ */
export const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


/* ============================================================
   VALIDAR TELÉFONO (Solo números)
   ============================================================ */
export const validarTelefono = (tel) => {
  return /^[0-9]{7,10}$/.test(tel);
};