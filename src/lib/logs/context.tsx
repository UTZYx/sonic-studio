import { createContext, useContext } from "react";

interface LogContextType {
    addLog: (msg: string) => void;
}

export const LogContext = createContext<LogContextType>({
    addLog: () => { } // No-op default
});

export const useLog = () => useContext(LogContext);
