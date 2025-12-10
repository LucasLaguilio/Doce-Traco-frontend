import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import { BrowserRouter , Routes , Route} from 'react-router-dom'
import Login from './login.tsx'
import Carrinho from './carrinho.tsx'
import AdminPage from './AdminPage.tsx'
import Home from './Home.tsx'
import AdicionarProdutos from './addprodutos.tsx'
import CarrinhoFiltro from './filtro-carrinho.tsx'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
// DEBUG: mostrar a chave pública lida (apenas para depuração em desenvolvimento)
console.log('DEBUG: VITE_STRIPE_PUBLIC_KEY =', import.meta.env.VITE_STRIPE_PUBLIC_KEY)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/filtro-carrinho" element={<CarrinhoFiltro />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path='/adicionarprodutos' element={<AdicionarProdutos/>} />
        </Routes>
      </BrowserRouter>
    </Elements>
  </StrictMode>,
)
