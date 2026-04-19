import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/protectRoute";
import PublicRoute from "./routes/publicRoute";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import Layout from "./components/layout";
import Translate from "./pages/translate";
import History from "./pages/History";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import JoinById from "./pages/JoinById";
import MeetingRoom from "./pages/MeetingRoom";
import UserList from "./pages/admin/UserList";
import UserHistory from "./pages/admin/UserHistory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/create-meeting"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateMeeting />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/join/:id"
          element={
            <ProtectedRoute>
              <Layout>
              <JoinMeeting />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/join"
          element={
            <ProtectedRoute>
              <Layout>
              <JoinById />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/meeting"
          element={
            <ProtectedRoute>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />


        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history/:id"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        
         <Route
          path="/translate"
          element={
            <ProtectedRoute>
              <Layout>
                <Translate />
              </Layout>
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
