"use client";

// Modal controlado por React (sin el JS de Bootstrap), igual que en mi-tienda.
// Lo usan los modales de las reservas para no repetir el mismo HTML.
export default function ModalBase({ titulo, children, pie, onCerrar }) {
  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">{pie}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
