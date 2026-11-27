// Un campo de formulario con los estilos de Bootstrap (is-invalid / is-valid y el mensaje).
// Lo usamos para <input> (por defecto), <select> (type="select" con las opciones como children)
// y <textarea> (type="textarea" con prop rows). Es el mismo que hicimos en mi-tienda.
export default function Campo({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  tocado,
  placeholder,
  disabled = false,
  autoComplete,
  requerido = false,
  rows = 3,
  children,
}) {
  const mostrarError = tocado && error;
  const esValido = tocado && !error;
  const clase = `${type === "select" ? "form-select" : "form-control"} ${
    mostrarError ? "is-invalid" : ""
  } ${esValido ? "is-valid" : ""}`;

  const props = {
    id,
    name: id,
    className: clase,
    value,
    onChange,
    onBlur,
    disabled,
    "aria-invalid": mostrarError ? "true" : undefined,
    "aria-describedby": mostrarError ? `${id}-error` : undefined,
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {requerido && <small className="text-danger"> *</small>}
      {type === "select" ? (
        <select {...props}>{children}</select>
      ) : type === "textarea" ? (
        <textarea {...props} rows={rows} placeholder={placeholder} />
      ) : (
        <input {...props} type={type} placeholder={placeholder} autoComplete={autoComplete} />
      )}
      {mostrarError && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
