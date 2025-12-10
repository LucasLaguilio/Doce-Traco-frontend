import React, { useState } from "react";
import CampoDeBusca from "./CampoDeBusca";

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
}

const Produtos: React.FC = () => {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: 1, nome: "Bolo de Brigadeiro", categoria: "Bolo", preco: 10 },
    { id: 2, nome: "Bolo de Ninho com Nutella", categoria: "Bolo", preco: 15 },
    { id: 3, nome: "Bolo de 4 Leites", categoria: "Bolo", preco: 10 },
  ]);

  
  const ehAdmin = true; 

 
  const excluirProduto = async (id: number) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmar) return;

    try {
    
      const resposta = await fetch(`http://localhost:8000/produtos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer SEU_TOKEN_AQUI", 
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir produto");
      }

  
      setProdutos((produtosAtuais) =>
        produtosAtuais.filter((p) => p.id !== id)
      );

      alert("Produto excluído com sucesso!");
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Não foi possível excluir o produto.");
    }
  };

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Lista de Produtos</h1>

      <CampoDeBusca
        valor={busca}
        onChange={setBusca}
        placeholder="Buscar por nome ou categoria..."
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((p) => (
            <li
              key={p.id}
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #ccc",
                paddingBottom: "5px",
              }}
            >
              <span>
                <strong>{p.nome}</strong> — {p.categoria} — R${p.preco}
              </span>

              {ehAdmin && (
                <button
                  onClick={() => excluirProduto(p.id)}
                  style={{
                    backgroundColor: "#c0392b",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Excluir
                </button>
              )}
            </li>
          ))
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </ul>
    </div>
  );
};

export default Produtos;
