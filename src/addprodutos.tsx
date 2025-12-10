
import './cssglobal.css'
import api from './api/api'

import { useState, useEffect } from 'react'
import React from 'react'

type ProdutoType = {
  _id: string,
  nome: string,
  preco: number,
  urlfoto: string,
  descricao: string
}

// ... (Manter o componente EditarProdutoForm como estava) ...
// (É exatamente o mesmo da resposta anterior)

interface EditarProdutoProps {
    produto: ProdutoType;
    onClose: () => void;
    onSave: (produtoAtualizado: ProdutoType) => void;
}

const EditarProdutoForm: React.FC<EditarProdutoProps> = ({ produto, onClose, onSave }) => {
    const [dadosForm, setDadosForm] = useState(produto);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDadosForm(prev => ({
            ...prev,
            [name]: name === 'preco' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Chamada PUT/PATCH protegida pelo Token JWT
        api.put(`/produtos/${dadosForm._id}`, dadosForm)
            .then(response => {
                onSave(response.data);
                onClose();
            })
            // O interceptor do axios em api.ts já tratará o erro 401/403 (redirecionando para /login)
            .catch(error => {
                // Se o erro não for 401/403, exibe uma mensagem genérica de erro (ex: 500)
                if (error.response?.status !== 401 && error.response?.status !== 403) {
                     alert('Erro ao atualizar produto: ' + (error.response?.data?.message || 'Tente novamente.'));
                }
            });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Editar Produto: {produto.nome}</h3>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        name="nome" 
                        value={dadosForm.nome} 
                        onChange={handleChange}
                        placeholder="Nome"
                    />
                    <input 
                        type="number" 
                        name="preco" 
                        value={dadosForm.preco} 
                        onChange={handleChange}
                        placeholder="Preço" 
                        step="0.01" 
                    />
                    <input 
                        type="text" 
                        name="urlfoto" 
                        value={dadosForm.urlfoto} 
                        onChange={handleChange}
                        placeholder="URL da Foto" 
                    />
                    <input 
                        type="text" 
                        name="descricao" 
                        value={dadosForm.descricao} 
                        onChange={handleChange}
                        placeholder="Descrição" 
                    />
                    <div className="modal-actions">
                        <button type="submit">Salvar Edição</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// -----------------------------------------------------------
// Componente Principal Refatorado
// -----------------------------------------------------------

function AdicionarProdutos() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([])
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<ProdutoType | null>(null);

  // Verifica se há um token, para mostrar o botão 'Editar' apenas para usuários logados.
  const [isUserLoggedIn] = useState(!!localStorage.getItem('token')); 
 
  // Carregar produtos
  useEffect(() => {
    api.get("/produtos")
      .then((response) => setProdutos(response.data))
      .catch((error) => console.error('Erro ao buscar produtos:', error))
  }, [])
  
  // Função de Cadastro (POST)
  function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const data: Omit<ProdutoType, '_id'> = {
      nome: formData.get('nome') as string,
      preco: Number(formData.get('preco')),
      urlfoto: formData.get('urlfoto') as string,
      descricao: formData.get('descricao') as string
    }

    api.post<ProdutoType>("/produtos", data)
    .then((response) => setProdutos([...produtos, response.data]))
    // O interceptor lida com o 401/403. Apenas exibe outros erros.
    .catch((error) => {
        if (error.response?.status !== 401 && error.response?.status !== 403) {
             alert('Erro ao adicionar produto: ' + (error.response?.data?.message || 'Tente novamente.'));
        }
    })
    form.reset()
  }

  // Função chamada pelo botão "Editar"
  const handleEditClick = (produto: ProdutoType) => {
    setProdutoEmEdicao(produto);
  };

  // Função chamada pelo formulário de edição após salvar
  const handleSaveEdit = (produtoAtualizado: ProdutoType) => {
    setProdutos(produtos.map(p => 
      p._id === produtoAtualizado._id ? produtoAtualizado : p
    ));
    setProdutoEmEdicao(null);
  };

  return (
    <>
      {/* O formulário de cadastro também deve ser visível apenas para usuários que podem postar (Admin) */}
      {isUserLoggedIn && (
        <>
            <h2>Cadastro de Produtos</h2>
            <form onSubmit={handleForm} className="add-produto-form"> 
              <input type="text" name="nome" placeholder="Nome" required />
              <input type="number" name="preco" placeholder="Preço" step="0.01" required />
              <input type="text" name="urlfoto" placeholder="URL da Foto" required />
              <input type="text" name="descricao" placeholder="Descrição" required />
              <button type="submit">Cadastrar</button>
            </form>
            <hr />
        </>
      )}

      <h3>Produtos Cadastrados</h3>
      <div className="produtos-lista">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto-item">
            <img src={produto.urlfoto} alt={produto.nome} width={200} />
            <div className="produto-info">
                <h3>{produto.nome}</h3>
                <p>Preço: R$ {produto.preco.toFixed(2)}</p>
                <p>{produto.descricao}</p>
                
                {/* O botão de edição só aparece se o usuário está logado */}
                {isUserLoggedIn && ( 
                  <>
                    <button onClick={() => handleEditClick(produto)} className="edit-button">
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) return;
                        api.delete(`/produtos/${produto._id}`)
                          .then(() => {
                            setProdutos(prev => prev.filter(p => p._id !== produto._id));
                            alert('Produto excluído com sucesso.');
                          })
                          .catch((error) => {
                            const msg = error.response?.data?.message || error.response?.data?.error || error.message;
                            if (error.response?.status === 401 || error.response?.status === 403) {
                              // O interceptor em api.ts já redireciona em 401, mas mostramos alerta também
                              alert('Permissão negada para excluir o produto.');
                            } else {
                              alert('Erro ao excluir produto: ' + msg);
                            }
                          });
                      }}
                      className="delete-button"
                      style={{ marginLeft: 8, backgroundColor: '#e74c3c', color: 'white' }}
                    >
                      Excluir
                    </button>
                  </>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Renderiza o formulário de edição (Modal) */}
      {produtoEmEdicao && (
          <EditarProdutoForm 
              produto={produtoEmEdicao}
              onClose={() => setProdutoEmEdicao(null)}
              onSave={handleSaveEdit}
          />
      )}
    </>
  )
}

export default AdicionarProdutos