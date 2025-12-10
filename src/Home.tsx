import './cssglobal.css'
import api from './api/api'
import { useState, useEffect } from 'react'

type ProdutoType = {
    _id: string,
    nome: string,
    preco: number,
    urlfoto: string,
    descricao: string
}



function Home() {
    const [produtos, setProdutos] = useState<ProdutoType[]>([])
    const [produtosOriginais, setProdutosOriginais] = useState<ProdutoType[]>([])
    const [busca, setBusca] = useState<string>('')

    useEffect(() => {
        api.get("/produtos")
            .then((response) => {
                console.log(response.data);
                setProdutos(response.data)
                setProdutosOriginais(response.data)
            })
            .catch((error) => console.error('Error fetching data:', error))
    }, [])

    const aplicarBusca = (termo?: string) => {
        const q = (termo ?? busca).trim().toLowerCase()
        if (!q) {
            setProdutos(produtosOriginais)
            return
        }
        const filtrados = produtosOriginais.filter(p => p.nome.toLowerCase().includes(q))
        setProdutos(filtrados)
    }

    function adicionarCarrinho(produtoId: string) {
        api.post("/adicionarItem", { produtoId, quantidade: 1 })
            .then(() => alert("Produto adicionado ao carrinho!"))
            .catch((error) => alert('Error adding to cart:' + error?.mensagem))
    }

    return (
        <>
           
            <a href='/Carrinho'>🛒 Ir para o Carrinho</a>
            <div style={{ marginTop: 12, marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="Buscar produtos por nome..."
                    value={busca}
                    onChange={(e) => { setBusca(e.target.value); aplicarBusca(e.target.value); }}
                    style={{ padding: '8px', marginRight: 8, width: 300 }}
                />
                <button type="button" onClick={() => aplicarBusca()} style={{ marginRight: 8 }}>Buscar</button>
                <button type="button" onClick={() => { setBusca(''); setProdutos(produtosOriginais); }}>Limpar</button>
            </div>
            <h2>Nossas Delícias Frescas</h2> {/* Título com a classe h2 estilizada */}

            {/* Aplica a classe de container para a lista de produtos */}
            <div className="produtos-lista"> 
                {
                    produtos.map((produto) => (
                        <div key={produto._id} className="produto-item"> {/* Aplica a classe de card de produto */}
                            
                            <img 
                                src={produto.urlfoto} 
                                alt={produto.nome} 
                                // Removendo o atributo 'width' fixo para o CSS controlar o tamanho
                            />
                            
                            <div className="produto-info"> {/* Aplica a classe para formatar o bloco de info */}
                                <h3>{produto.nome}</h3> {/* Título com a classe h3 estilizada */}
                                
                                <p>R$ {produto.preco.toFixed(2)}</p> {/* Formata o preço */}
                                
                                <p>{produto.descricao}</p>
                                
                                <button onClick={()=>adicionarCarrinho(produto._id)}>
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>
            
            {/* O "Lista de Produtos" foi removido/substituído pelo h2 para ficar mais limpo e bonito */}
        </>
    )
}

export default Home