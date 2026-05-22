import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./firebase";

import Dashboard from "./pages/Dashboard";

import Journal from "./pages/Journal";

import CalendarView from "./pages/CalendarView";

import DaysLesson from "./pages/DaysLesson";

import BacktestJournal from "./pages/BacktestJournal";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";

export default function App() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser);

          setLoading(false);

        }
      );

    return () =>
      unsubscribe();

  }, []);

  // ✅ LOADING
  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
      ">

        Loading...

      </div>

    );

  }

  return (

    <BrowserRouter>

      {!user ? (

        <Routes>

          <Route
            path="*"
            element={<Login />}
          />

        </Routes>

      ) : (

        <>

          <Navbar />

          <div className="
            p-4
            bg-black
            min-h-screen
            text-white
          ">

            <Routes>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/journal"
                element={<Journal />}
              />

              {/* ✅ BACKTEST */}
              <Route
                path="/backtest"
                element={
                  <BacktestJournal />
                }
              />

              <Route
                path="/calendar"
                element={
                  <CalendarView />
                }
              />

              <Route
                path="/lessons"
                element={
                  <DaysLesson />
                }
              />

              <Route
                path="*"
                element={
                  <Navigate to="/" />
                }
              />

            </Routes>

          </div>

        </>

      )}

    </BrowserRouter>

  );

}