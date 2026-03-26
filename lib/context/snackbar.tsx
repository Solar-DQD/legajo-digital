'use client'

import { createContext, useCallback, useContext, useState } from "react";
import Slide, { SlideProps } from '@mui/material/Slide';
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";

type Severity = 'success' | 'error' | 'warning' | 'info';

interface Message {
    id: string;
    message: string;
    severity: Severity;
    duration?: number;
};

interface ContextType {
    showSnackbar: (message: string, severity: Severity, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
};

const Context = createContext<ContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction='up' />;
};

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [snackbars, setSnackbars] = useState<Message[]>([]);

    const removeSnackbar = useCallback((id: string) => {
        setSnackbars(previous => previous.filter(snackbar => snackbar.id != id));
    }, []);

    const showSnackbar = useCallback((message: string, severity: Severity, duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString(36);
        const newSnackbar = { id, message, severity, duration };

        setSnackbars(previous => [...previous, newSnackbar]);
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showSnackbar(message, 'success', duration);
    }, [showSnackbar]);

    const showError = useCallback((message: string, duration?: number) => {
        showSnackbar(message, 'error', duration);
    }, [showSnackbar]);

    const showWarning = useCallback((message: string, duration?: number) => {
        showSnackbar(message, 'warning', duration);
    }, [showSnackbar]);

    const showInfo = useCallback((message: string, duration?: number) => {
        showSnackbar(message, 'info', duration);
    }, [showSnackbar]);

    return (
        <Context.Provider
            value={{
                showSnackbar,
                showSuccess,
                showError,
                showWarning,
                showInfo
            }}
        >
            {children}
            {snackbars.map((snackbar, index) => {
                const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
                    if (reason === 'clickaway') {
                        return;
                    };
                    removeSnackbar(snackbar.id);
                };

                return (
                    <Snackbar
                        key={snackbar.id}
                        open={true}
                        autoHideDuration={snackbar.duration}
                        slots={{ transition: SlideTransition }}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center'
                        }}
                        sx={{
                            bottom: `${20 + (index * 70)}px !important`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            position: 'fixed'
                        }}
                    >
                        <Alert
                            onClose={handleClose}
                            severity={snackbar.severity}
                            variant='filled'
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                );
            })}
        </Context.Provider>
    );
};

export function useSnackbar() {
    const context = useContext(Context);

    if (context === undefined) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    };

    return context;
};