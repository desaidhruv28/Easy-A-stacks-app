import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import QuizGenerator from "./components/QuizGenerator";
import VideoComponent from "./components/VideoComponent";
import UserList from "./components/UserList";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Mainsection from "./components/MainSection";
import Achievement from "./components/Achievement";
import FundRaising from "./components/FundRaising";
import Faq from "./components/Faq";
import LeaderBoard from "./components/LeaderBoard";
import Footer from "./components/Footer";

function App() {
	return (
		<Router>
			<Routes>
				{/* Public Routes */}
				<Route path="/login" element={<Login />} />

				{/* Protected Routes */}
				<Route element={<Layout />}>
					<Route
						path="/"
						element={<Navigate to="/videos" replace />}
					/>
					<Route
						path="/videos"
						element={
							<ProtectedRoute>
								<Mainsection />
								<Achievement />
								<FundRaising />
								<Faq />
								<VideoComponent />
								<QuizGenerator />
								<LeaderBoard />
								<UserList />
								<Footer />
							</ProtectedRoute>
						}
					/>
					{/* <Route
						path="/quiz"
						element={
							<ProtectedRoute>
								<QuizGenerator />
							</ProtectedRoute>
						}
					/> */}
					{/* <Route
						path="/users"
						element={
							<ProtectedRoute>
								<UserList />
							</ProtectedRoute>
						}
					/> */}
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
