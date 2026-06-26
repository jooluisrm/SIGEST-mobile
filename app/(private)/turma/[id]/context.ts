import { createContext, useContext } from 'react';

export const TurmaContext = createContext<{ id: string }>({ id: '' });

export function useTurmaId() {
    return useContext(TurmaContext).id;
}
