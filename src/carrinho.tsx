import './cssglobal.css'
import api from './api/api'
import { 
    useStripe, 
    useElements, 
    CardNumberElement, 
    CardExpiryElement, 
    CardCvcElement
} from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react'
import axios from 'axios' 

type ItemCarrinho = {
    _id?: string,
    produtoId: string,
    nome: string,
    precoUnitario: number,
    urlfoto?: string,
    descricao?: string,
    quantidade: number
}

type ProdutoType = {
    _id: string,
    nome: string,
    preco: number,
    urlfoto: string,
    descricao: string
}

function Carrinho() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [itens, setItens] = useState<ItemCarrinho[]>([])
    const [itensOriginais, setItensOriginais] = useState<ItemCarrinho[]>([])
    const [produtos, setProdutos] = useState<ProdutoType[]>([])
    const [filtros, setFiltros] = useState({ nome: '', precoMin: '', precoMax: '' })

    const totalCarrinho = itens.reduce((acc, item) => 
        acc + (item.precoUnitario * item.quantidade), 0
    )
    const totalCarrinhoFormatado = totalCarrinho.toFixed(2)

    const pagar = async () => {
        if (!stripe || !elements) {
            setStatus("❌ Stripe não inicializado");
            return;
        }

        // DEBUG: verificar se o publishable key está sendo lido no frontend
        console.log('DEBUG: VITE_STRIPE_PUBLIC_KEY (frontend)=', import.meta.env.VITE_STRIPE_PUBLIC_KEY)
        console.log('DEBUG: stripe object present =', !!stripe)
        console.log('DEBUG: elements present =', !!elements)

        setLoading(true);
        setStatus("");

        try {
            // Criar o payment intent no backend
            const { data } = await api.post("/criar-pagamento-cartao");
            const { clientSecret } = data;

            if (!clientSecret) {
                setStatus("❌ Erro: Client secret não recebido");
                setLoading(false);
                return;
            }

            // Confirmar o pagamento com o Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement)!,
                    billing_details: {
                        name: "Cliente Doce Traço",
                    },
                },
            });

            if (result.error) {
                setStatus(`❌ Erro: ${result.error.message}`);
            } else if (result.paymentIntent?.status === "succeeded") {
                setStatus("✅ Pagamento aprovado! Obrigado por sua compra!");
                setItens([]);
                // Limpar o carrinho no backend
                try {
                    await api.delete("/carrinho");
                } catch (e) {
                    console.log("Carrinho já foi limpo ou erro ao limpar");
                }
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                setStatus(`⏳ Status: ${result.paymentIntent?.status}`);
            }
        } catch (error) {
            console.error("Erro ao processar pagamento:", error);
            const mensagem = axios.isAxiosError(error) 
                ? error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao comunicar com o servidor.' 
                : 'Erro de rede ou conexão.';
            setStatus(`❌ Erro: ${mensagem}`);
        }

        setLoading(false);
    };

    const aplicarFiltroLocal = (originais: ItemCarrinho[], filtrosState: { nome: string; precoMin: string; precoMax: string; }) => {
        const nomeFiltro = filtrosState.nome?.trim().toLowerCase() || '';
        const min = filtrosState.precoMin ? Number(filtrosState.precoMin) : undefined;
        const max = filtrosState.precoMax ? Number(filtrosState.precoMax) : undefined;

        const filtrados = originais.filter(item => {
            const nomeOK = nomeFiltro ? item.nome.toLowerCase().includes(nomeFiltro) : true;
            const preco = (item.precoUnitario ?? (item as any).preco) as number;
            const minOK = typeof min === 'number' ? preco >= min : true;
            const maxOK = typeof max === 'number' ? preco <= max : true;
            return nomeOK && minOK && maxOK;
        });

        setItens(filtrados);
    }

    const buscarItens = async () => {
        try {
            const res = await api.get('/carrinho')
            const carrinho = res.data.itens || res.data
            const array = Array.isArray(carrinho) ? carrinho : (carrinho.itens || [])
            setItensOriginais(array)
            aplicarFiltroLocal(array, filtros)
        } catch (error) {
            console.error('Error fetching cart:', error)
        }
    }

    useEffect(() => {
        api.get('/produtos')
            .then((response) => setProdutos(response.data))
            .catch((error) => console.error('Error fetching products:', error))

        buscarItens()
    }, [])

    function removerCarrinho() {
        api.delete("/carrinho")
            .then(() => {
                setItens([])
                alert("Carrinho esvaziado!")
            })
            .catch((error) => {
                const mensagem = axios.isAxiosError(error) ? error.response?.data?.message || 'Erro desconhecido.' : 'Erro de rede.';
                alert(`Erro ao remover carrinho: ${mensagem}`);
            })
    }
    
    function removerunidadeItem(produtoId: string) {
        api.post("/removerunidadeItem", { produtoId })
            .then((response) => {
                const itensAtualizados = response.data.itens || [];
                setItens(itensAtualizados);
                alert("Uma unidade do item foi removida do carrinho!");
            })
            .catch((error) => {
                const mensagem = axios.isAxiosError(error) ? error.response?.data?.message || 'Erro desconhecido.' : 'Erro de rede.';
                alert(`Erro ao remover unidade do item: ${mensagem}`);
            })
    }

    function getDadosProduto(produtoId: string) {
        const produto = produtos.find(p => p._id === produtoId)
        return produto || { urlfoto: '', descricao: 'Produto não encontrado' }
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); pagar(); }}> 
            <h1>🛒 Seu Pedido Doce</h1>
            <a href='/'>← Continuar Comprando</a>

            <div className="filtros-carrinho" style={{ marginTop: '12px', marginBottom: '12px' }}>
                <input
                    type="text"
                    placeholder="Filtrar por nome"
                    value={filtros.nome}
                    onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
                    style={{ marginRight: '8px', padding: '6px' }}
                />
                <input
                    type="number"
                    placeholder="Preço mínimo"
                    value={filtros.precoMin}
                    onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
                    style={{ marginRight: '8px', padding: '6px', width: '120px' }}
                />
                <input
                    type="number"
                    placeholder="Preço máximo"
                    value={filtros.precoMax}
                    onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
                    style={{ marginRight: '8px', padding: '6px', width: '120px' }}
                />
                <button type="button" onClick={() => aplicarFiltroLocal(itensOriginais, filtros)} style={{ marginRight: '8px' }}>
                    Filtrar
                </button>
                <button type="button" onClick={() => { setFiltros({ nome: '', precoMin: '', precoMax: '' }); setItens(itensOriginais); }}>
                    Limpar filtros
                </button>
            </div>
            
            <div>
                <h2>Itens no Carrinho ({itens.length})</h2>
                {itens.length > 0 && (
                    <button type="button" onClick={removerCarrinho} className="carrinho-vazio-btn">
                        🗑️ Esvaziar Carrinho
                    </button>
                )}
            </div>

            {itens.length === 0 ? (
                <p>Seu carrinho está vazio. Adicione um bolo!</p>
            ) : (
                <>
                    {itens.map((item) => {
                        const dadosProduto = getDadosProduto(item.produtoId)
                        return (
                            <div key={item.produtoId} className="carrinho-item">
                                <img 
                                    src={item.urlfoto || dadosProduto.urlfoto} 
                                    alt={item.nome} 
                                />
                                <div className="carrinho-info">
                                    <h3>{item.nome}</h3>
                                    <p>Preço Unitário: R$ {item.precoUnitario.toFixed(2)}</p>
                                    <p>Quantidade: {item.quantidade}</p>
                                    <p>Subtotal: R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</p>
                                    <button type="button" className="removerbtn" onClick={() => removerunidadeItem(item.produtoId)}>
                                        Remover Unidade
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    <div className="carrinho-total">
                        <h3>Total da Compra: R$ {totalCarrinhoFormatado}</h3>
                    </div>

                    <div className="checkout-form">
                        <h2>💳 Detalhes do Cartão</h2>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
                            <strong>Dados de teste:</strong> 4242 4242 4242 4242 | 12/25 | 123
                        </p>
                        
                        <div className="form-group">
                            <label htmlFor="card-number">Número do Cartão</label>
                            <div style={{ 
                                padding: '12px 15px',
                                border: '2px solid #DDD',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                minHeight: '44px',
                                fontSize: '16px'
                            }}>
                                <CardNumberElement 
                                    id="card-number" 
                                    options={{ 
                                        style: { 
                                            base: { 
                                                fontSize: '16px',
                                                color: '#444444',
                                                fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                                                '::placeholder': { color: '#999999' }
                                            },
                                            invalid: { color: '#FF0000' }
                                        },
                                        placeholder: 'Número do cartão'
                                    }} 
                                />
                            </div>
                        </div>

                        <div className="card-details-row">
                            <div className="form-group expiry-group">
                                <label htmlFor="card-expiry">Validade (MM/YY)</label>
                                <div style={{ 
                                    padding: '12px 15px',
                                    border: '2px solid #DDD',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    minHeight: '44px',
                                    fontSize: '16px'
                                }}>
                                    <CardExpiryElement 
                                        id="card-expiry" 
                                        options={{ 
                                            style: { 
                                                base: { 
                                                    fontSize: '16px',
                                                    color: '#444444',
                                                    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                                                    '::placeholder': { color: '#999999' }
                                                },
                                                invalid: { color: '#FF0000' }
                                            },
                                            placeholder: 'MM/YY'
                                        }} 
                                    />
                                </div>
                            </div>

                            <div className="form-group cvc-group">
                                <label htmlFor="card-cvc">CVC</label>
                                <div style={{ 
                                    padding: '12px 15px',
                                    border: '2px solid #DDD',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    minHeight: '44px',
                                    fontSize: '16px'
                                }}>
                                    <CardCvcElement 
                                        id="card-cvc" 
                                        options={{ 
                                            style: { 
                                                base: { 
                                                    fontSize: '16px',
                                                    color: '#444444',
                                                    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                                                    '::placeholder': { color: '#999999' }
                                                },
                                                invalid: { color: '#FF0000' }
                                            },
                                            placeholder: 'CVC'
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !stripe || !elements}
                            style={{ 
                                backgroundColor: '#FF69B4', 
                                color: 'white', 
                                padding: '14px 20px', 
                                border: 'none', 
                                cursor: loading || !stripe || !elements ? 'not-allowed' : 'pointer', 
                                marginTop: '20px', 
                                borderRadius: '4px', 
                                fontSize: '16px', 
                                fontWeight: '600',
                                opacity: loading || !stripe || !elements ? 0.6 : 1,
                                transition: 'opacity 0.3s ease'
                            }}
                        >
                            {loading ? "⏳ Processando..." : `💰 Pagar R$ ${totalCarrinhoFormatado}`}
                        </button>
                        
                        {status && (
                            <p style={{ 
                                marginTop: '15px', 
                                fontWeight: 'bold', 
                                fontSize: '14px',
                                padding: '10px',
                                borderRadius: '4px',
                                backgroundColor: status.includes('❌') ? '#FFE0E0' : status.includes('✅') ? '#E0FFE0' : '#E0F0FF',
                                color: status.includes('❌') ? '#B22222' : status.includes('✅') ? '#228B22' : '#0066CC'
                            }}>
                                {status}
                            </p>
                        )}
                    </div>
                </>
            )}
        </form>
    )
}

export default Carrinho