import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { loadClubByID, updateClub } from '../api/clubs';

const InfoClubLogges = () => {
    const { user } = useAuth();
    const [club, setClubs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clubData = await loadClubByID(user.clubId);
                setClubs(clubData);
            } catch (error) {
            console.error('Errore nel caricamento dei dati del club:', error);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div>
            <h1>
                Interfaccia figa per vedere i dettagli del club, magari con anche il logo e la possibilità di editare i campi.
            </h1> 
        </div> 
    );
};

export default InfoClubLogges;