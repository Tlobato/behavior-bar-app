import React from 'react';
import { User, UserListProps } from '../types';

export const UserList: React.FC<UserListProps> = ({
    users,
    isLoading,
    error,
    onAccessBoard,
    onEditUser,
    onDeleteUser,
    currentUser
}) => {
    // Filtra o usuário atual da lista independentemente do papel
    const filteredUsers = users.filter((user: User) => Number(user.id) !== Number(currentUser?.id));
    // Logs para depuração
    console.log('currentUser:', currentUser);
    console.log('users:', users);
    console.log('filteredUsers:', filteredUsers);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    if (filteredUsers.length === 0) {
        return <div className="text-center text-gray-500 p-4">Nenhum usuário encontrado.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.nome || user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                    user.role === 'TUTOR' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-green-100 text-green-800'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onAccessBoard(user)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Acessar Board
                                    </button>
                                    <button
                                        onClick={() => onEditUser(user)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 