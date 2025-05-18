// pages/MissionPage/MissionPage.tsx
import React from 'react';
import './MissionPage.css';
import Header from '../../components/Header/Header';
import MissionCreateModal from '../../components/MissionCreateModal/MissionCreateModal';
import MissionEditModal from '../../components/MissionEditModal/MissionEditModal';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import MissionList from '../../components/MissionList/MissionList';
import { useMissionData } from '../../hooks/useMissionData';

const MissionPage: React.FC = () => {
    const {
        missions,
        isLoading,
        error,
        isModalOpen,
        setIsModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        missionToEdit,
        shouldShowHotspot,
        currentUser,
        pageName,
        getUserName,
        handleLogout,
        handleHotspotClose,
        openEditModal,
        handleUpdate,
        handleDelete,
        openDeleteModal,
        handleManageTasks,
        handleCreateMission
    } = useMissionData();

    return (
        <div className="mission-page">
            <Header
                projectName="Behavior Bar"
                userName={currentUser?.name || 'Usuário'}
                onLogout={handleLogout}
                pageName={pageName}
            />

            <div className="page-content">
                <Sidebar />

                <main className="main-content">
                    <div className="mission-container">
                        <NewRegistrationComponent
                            title="Nova Missão"
                            buttonText="Criar"
                            onButtonClick={() => setIsModalOpen(true)}
                        />

                        <MissionList
                            missions={missions}
                            isLoading={isLoading}
                            error={error}
                            shouldShowHotspot={shouldShowHotspot}
                            getUserName={getUserName}
                            handleManageTasks={handleManageTasks}
                            openEditModal={openEditModal}
                            openDeleteModal={openDeleteModal}
                            handleHotspotClose={handleHotspotClose}
                        />
                    </div>
                </main>
            </div>

            <MissionCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateMission}
            />

            <MissionEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdate}
                mission={missionToEdit}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Missão"
                message="Tem certeza que deseja excluir esta missão? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default MissionPage;