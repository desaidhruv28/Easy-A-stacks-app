import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Alert,
	Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Login = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Set a dummy token for now
		localStorage.setItem("userToken", "dummy-token");

		// Redirect to videos page
		navigate("/videos");
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Paper elevation={3} sx={{ p: 4, width: "100%" }}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<LockOutlinedIcon
							sx={{
								m: 1,
								bgcolor: "primary.main",
								color: "white",
								p: 1,
								borderRadius: "50%",
							}}
						/>
						<Typography component="h1" variant="h5">
							Sign in
						</Typography>
					</Box>

					{error && (
						<Alert severity="error" sx={{ mt: 2 }}>
							{error}
						</Alert>
					)}

					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{ mt: 1 }}
					>
						<TextField
							margin="normal"
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={formData.email}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={formData.password}
							onChange={handleChange}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Sign In
						</Button>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
};

export default Login;
