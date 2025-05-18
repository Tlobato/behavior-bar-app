import React from 'react';
import './UserManagementPage.css';
import Header from '../../components/Header/Header';
import UserCreateModal from '../../components/UserCreateModal/UserCreateModal';
import UserEditModal from '../../components/UserEditModal/UserEditModal';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserList from '../../components/UserList/UserList';
import { useUserManagement } from '../../hooks/useUserManagement';

const UserManagement: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    isModalOpen,
    isDeleteModalOpen,
    isEditModalOpen,
    userToEdit,
    currentUser,
    pageName,
    
    setIsModalOpen,
    setIsDeleteModalOpen,
    setIsEditModalOpen,
    
    handleLogout,
    openEditModal,
    handleUpdate,
    openDeleteModal,
    handleDelete,
    handleAccessBoard,
    handleCreateUser
  } = useUserManagement();

  return (
    <div className="user-management-page">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout}
        pageName={pageName}
      />
      
      <div className="page-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="user-management-container">
            <NewRegistrationComponent
              title="Novo Usuário"
              buttonText="Criar"
              onButtonClick={() => setIsModalOpen(true)}
            />

            <UserList
              users={users}
              isLoading={isLoading}
              error={error}
              onAccessBoard={handleAccessBoard}
              onEditUser={openEditModal}
              onDeleteUser={openDeleteModal}
            />
          </div>
        </main>
      </div>

      <UserCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
      />

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
        user={userToEdit}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default UserManagement;