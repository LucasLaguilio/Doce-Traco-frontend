import { useState, useEffect } from "react";
import axios from "axios";
import './cssglobal.css'

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

interface Filtros {
  nome: string;
  precoMin: string;
  precoMax: string;
}

export default function Carrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    nome: "",
    precoMin: "",
    precoMax: "",
  });

  const buscarItens = async () => {
    try {
      const res = await axios.get("http://localhost:8000/carrinho", {
        params: filtros,
      });
      setItens(res.data);
    } catch (err) {
      console.error("Erro ao buscar itens:", err);
    }
  };

  useEffect(() => {
    buscarItens();
  }, []);

  return (
    <div className="carrinho-container">
      <h2>🛒 Carrinho</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={filtros.nome}
          onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
        />
        <input
          type="number"
          placeholder="Preço mínimo"
          value={filtros.precoMin}
          onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
        />
        <input
          type="number"
          placeholder="Preço máximo"
          value={filtros.precoMax}
          onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
        />
        <button onClick={buscarItens}>Filtrar</button>
      </div>

      <table className="tabela-carrinho">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço (R$)</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {itens.length > 0 ? (
            itens.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.preco.toFixed(2)}</td>
                <td>{item.quantidade}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="nenhum-item">
                Nenhum item encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}