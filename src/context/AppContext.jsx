import React, { createContext, useContext, useState } from "react";
import { eventsDataDefault } from "../data/constants";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [eventsData, setEventsData] = useState(eventsDataDefault);
  const [bookings, setBookings] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = localStorage.getItem("momento_user");
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.removeItem("momento_user");
    setLoggedInUser(null);
  };

  const addBooking = (booking) => {
    setBookings(p => [...p, booking]);
  };

  return (
    <AppContext.Provider
      value={{
        eventsData,
        setEventsData,
        bookings,
        setBookings,   // ✅ ADD THIS
        addBooking,
        loggedInUser,
        setLoggedInUser,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => useContext(AppContext);