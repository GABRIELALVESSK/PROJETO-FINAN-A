import React, { createContext, useContext, useState, ReactNode } from "react";

interface DateContextType {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    prevMonth: () => void;
    nextMonth: () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 1)); // Fevereiro 2026

    const prevMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate, prevMonth, nextMonth }}>
            {children}
        </DateContext.Provider>
    );
}

export function useDate() {
    const context = useContext(DateContext);
    if (context === undefined) {
        throw new Error("useDate must be used within a DateProvider");
    }
    return context;
}
