import { useNavigate, useSearchParams } from "react-router-dom";
import api from "./api/api";
import './cssglobal.css'
import React from "react";

function Login(){
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const mensagem = searchParams.get("mensagem")

    function handleSubmit(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email")
        const senha = formData.get("senha")

        api.post("/login",{
            email,
            senha
        }).then(resposta=>{
            if(resposta.status===200){
                localStorage.setItem("token",resposta?.data?.token)
                navigate("/")
            }
        }).catch((error:any)=>{
            const msg = error?.response?.data?.mensagem || 
                         error?.mensagem || 
                         "Erro Desconhecido!"
            navigate(`/login?mensagem=${encodeURIComponent(msg)}`)
        })
    }

    return(
    <>
        <h1>🧁 Login da Confeitaria</h1>
        {mensagem && <p className="erro">{mensagem}</p>} {/* Usa a classe erro para mensagens */}
        <form onSubmit={handleSubmit}>
            <input type="text" name="email" id="email" placeholder="Email" required />
            <input type="password" name="senha" id="senha" placeholder="Senha" required />
            <button type="submit">Entrar</button>
        </form>
    </>
    )
}
export default Login;