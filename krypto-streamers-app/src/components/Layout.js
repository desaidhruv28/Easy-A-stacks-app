import { Outlet, useNavigate } from "react-router-dom";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Box,
	Container,
} from "@mui/material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import QuizIcon from "@mui/icons-material/Quiz";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import Navbar from "./Navbar";

const Layout = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		// Clear user session/token
		localStorage.removeItem("userToken");
		navigate("/login");
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			{/* <Navbar /> */}
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h6"
						component="div"
						sx={{ flexGrow: 1 }}
					>
						Krypto Streamers
					</Typography>
					<Button
						color="inherit"
						startIcon={<VideoLibraryIcon />}
						onClick={() => navigate("/videos")}
					>
						Videos
					</Button>
					<Button
						color="inherit"
						startIcon={<QuizIcon />}
						onClick={() => navigate("/quiz")}
					>
						Quiz
					</Button>
					<Button
						color="inherit"
						startIcon={<PeopleIcon />}
						onClick={() => navigate("/users")}
					>
						Users
					</Button>
					<Button
						color="inherit"
						startIcon={<LogoutIcon />}
						onClick={handleLogout}
					>
						Logout
					</Button>
				</Toolbar>
			</AppBar>
			<Container component="main" sx={{ flexGrow: 1, py: 3 }}>
				<Outlet />
			</Container>
		</Box>
	);
};

export default Layout;
