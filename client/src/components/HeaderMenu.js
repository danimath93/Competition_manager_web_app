import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars,
  FaSignOutAlt,
  FaUniversity
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getBlobDocumento } from '../api/documents';
import { loadClubByID } from '../api/clubs';
import ConfirmActionModal from './common/ConfirmActionModal';
import './styles/HeaderMenu.css';

const HeaderMenu = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoSource, setLogoSource] = useState(null);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [isConfirmLogoutModalOpen, setIsConfirmLogoutModalOpen] = useState(false);

  // Carica il logo del club quando l'utente cambia
  useEffect(() => {
    let isMounted = true;
    let currentBlobUrl = null;

    const loadLogo = async () => {
      // Revoca URL precedente
      setLogoSource(prevUrl => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });

      if (user?.clubId) {
        setLoadingLogo(true);
        try {
          const club = await loadClubByID(user.clubId);
          
          if (club?.logoId && isMounted) {
            const blob = await getBlobDocumento(club.logoId);
            
            if (blob && isMounted) {
              currentBlobUrl = URL.createObjectURL(blob);
              setLogoSource(currentBlobUrl);
            }
          }
        } catch (error) {
          console.error('Errore nel caricamento del logo del club:', error);
        } finally {
          if (isMounted) {
            setLoadingLogo(false);
          }
        }
      } else {
        setLoadingLogo(false);
      }
    };

    loadLogo();

    // Cleanup
    return () => {
      isMounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [user?.clubId]);

  const handleLogoutCheckConfirm = () => {
    setIsConfirmLogoutModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="header-menu">
        <div className="header-menu-left">
          {/* Logo Club */}
          <div 
            className="header-menu-logo"
            title={`${user?.username || 'Utente'}${user?.clubName ? `\n${user.clubName}` : ''}`}
          >
            {!loadingLogo && (
              <>
                {logoSource ? (
                  <img 
                    src={logoSource} 
                    alt="Club Logo" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="header-menu-logo-placeholder" 
                  style={{ display: logoSource ? 'none' : 'flex' }}
                >
                  <FaUniversity />
                </div>
              </>
            )}
          </div>

          {/* Menu Button */}
          <button 
            className="header-menu-btn"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>
        </div>

        {/* Logout Button */}
        <button 
          className="header-menu-logout-btn"
          onClick={handleLogoutCheckConfirm}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>
      </header>

      {isConfirmLogoutModalOpen && (
        <ConfirmActionModal
          open={isConfirmLogoutModalOpen}
          onClose={() => setIsConfirmLogoutModalOpen(false)}
          title="Conferma Logout"
          message="Sei sicuro di voler effettuare il logout?"
          primaryButton={{
            text: 'Conferma',
            onClick: handleLogout,  
          }}
          secondaryButton={{
            text: 'Annulla',
            onClick: () => setIsConfirmLogoutModalOpen(false),
          }}
        />
      )}
    </>
  );
};

export default HeaderMenu;
