import React from "react";
import './cssglobal.css'

interface CampoDeBuscaProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

const CampoDeBusca: React.FC<CampoDeBuscaProps> = ({
  valor,
  onChange,
  placeholder = "Buscar...",
}) => {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "10px",
        width: "100%",
        maxWidth: "400px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        outline: "none",
        marginBottom: "20px",
      }}
    />
  );
};

export default CampoDeBusca;

