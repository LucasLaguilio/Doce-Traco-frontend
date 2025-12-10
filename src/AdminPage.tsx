import { useEffect, useState } from "react";
import axios from "axios";
import './cssglobal.css'

interface Usuario {
    _id: string | { toString: () => string };
    id?: number;
    nome: string;
    email: string;
    tipo: string;
    idade?: number;
    carrinho?: {
        usuarioId: string;
        itens: Array<{ produtoId?: string; nome?: string; quantidade?: number; precoUnitario?: number }>;
        total?: number;
    };
}

function AdminPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [erro, setErro] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setErro("Você não tem permissão para acessar esta área.");
            return;
        }

        axios.get("http://localhost:8000/usuarios?includeCarts=true", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUsuarios(res.data))
            .catch((err) => {
                console.error(err);
                setErro("Acesso negado ou erro ao carregar usuários.");
            });
    }, []);

    if (erro) {
        return <p className="erro">{erro}</p>;
    }

    return (
        <div className="admin-container"> {/* CLASSE CSS para o container principal da página de administração */}
            <h1> Painel Administrativo de Usuários</h1> {/* Utiliza o H1 estilizado */}
            <p>Listagem de todos os usuários cadastrados no sistema</p>

            {usuarios.length === 0 ? (
                <p>Nenhum usuário encontrado.</p>
            ) : (
                <table> {/* A tag <table> será estilizada pelo CSS Global */}
                    <thead>
                        <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Idade</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Carrinho</th>
                        </tr>
                    </thead>
                    <tbody>
                                {usuarios.map((u) => {
                                    const uid = String((u as any)._id);
                                    const numItens = u.carrinho?.itens?.reduce((acc, it) => acc + (it.quantidade || 0), 0) ?? 0;
                                    const total = u.carrinho?.total ?? 0;
                                    return (
                                        <tr key={uid}> {/* As linhas <tr> e células <td> são estilizadas pelo CSS */}
                                            <td>{uid}</td>
                                            <td>{u.nome}</td>
                                            <td>{u.idade}</td>
                                            <td>{u.email}</td>
                                            <td>{u.tipo}</td>
                                            <td>{numItens} itens — R$ {Number(total).toFixed(2)}</td>
                                        </tr>
                                    )
                                })}
                    </tbody>
                </table>
            )}
        </div>
    );
} 	export default AdminPage;